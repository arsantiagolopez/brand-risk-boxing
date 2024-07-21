import type { NextApiRequest, NextApiResponse } from "next";
import { type Fields, type Files, IncomingForm } from "formidable";
import { createReadStream } from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import { randomUUID } from "crypto";
import { createImageData } from "@/lib/utils/api/create-image-data";
import { convertUnsupportedToJpeg } from "@/lib/utils/api/image-helpers";

type ImgbbData = {
  data: {
    url: string;
    width: string;
    height: string;
  };
  error: {
    message: string;
    code: 313;
  };
};

type ParseFormResponse = {
  fields: Fields;
  files: Files;
};

const parseForm = async (req: NextApiRequest): Promise<ParseFormResponse> => {
  const form = new IncomingForm();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) =>
      err ? reject(err) : resolve({ fields, files })
    );
  });
};

const uploadToImgbb = async (filePath: string): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("image", createReadStream(filePath), randomUUID());

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const { error } = (await response.json()) as ImgbbData;
    throw new Error(error.message);
  }

  const { data } = (await response.json()) as ImgbbData;

  await createImageData(filePath, data.url, data.width, data.height);

  return { url: data.url };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { files } = await parseForm(req);

    if (!files.image) {
      throw new Error("No image file passed");
    }

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    const imagePath = imageFile.filepath;

    try {
      const { url } = await uploadToImgbb(imagePath);
      res.status(200).json({ url });
      return;
    } catch (error) {
      if (error instanceof Error) {
        const { message } = error;

        switch (true) {
          // Convert image to JPEG
          case message.includes("Unavailable image format"):
            const newPath = await convertUnsupportedToJpeg(imagePath);
            const { url: newUrl } = await uploadToImgbb(newPath);
            res.status(200).json({ url: newUrl });
            break;
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
