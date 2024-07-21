import sharp from "sharp";
import { promises as fs } from "fs";

const basePath = "src/data/images";
const filePath = `${basePath}/data.ts`;

type SingleImageData = {
  blurDataURL: string;
  width: string;
  height: string;
};

type ImageData = {
  [key: string]: SingleImageData;
};

const createImageData = async (
  imagePath: string,
  url: string,
  width: string,
  height: string
): Promise<void> => {
  try {
    const base64Image = await sharp(imagePath)
      .resize(10) // Resize to 10 pixels wide
      .blur() // Apply a mild blur
      .toFormat("jpeg") // Convert to JPEG format
      .toBuffer() // Convert to a Buffer
      .then((buffer) => `data:image/jpeg;base64,${buffer.toString("base64")}`);

    // Initialize or update the data object
    let fileContent = "";
    let imageData: ImageData = {};

    // Attempt to read and parse existing data, then update
    try {
      fileContent = await fs.readFile(filePath, "utf8");
      // Extract JSON data between the delimiters
      const jsonDataStart =
        fileContent.indexOf("export const data: Record<string, ImageData> = ") +
        "export const data: Record<string, ImageData> = ".length;
      const jsonDataEnd = fileContent.lastIndexOf(";");
      if (jsonDataStart !== -1 && jsonDataEnd !== -1) {
        const jsonData = fileContent.substring(jsonDataStart, jsonDataEnd);
        imageData = JSON.parse(jsonData);
      }
    } catch (error) {
      console.error(
        "Error reading the existing data.ts file. Creating a new one if not present.",
        error
      );
      // In case there's no file or it's unreadable, initialize with empty data
      fileContent = `type ImageData = {
  blurDataURL: string;
  width: number;
  height: number;
};

export const data: Record<string, ImageData> = `;
    }

    // Update the imageData object
    imageData[url] = {
      blurDataURL: base64Image,
      width,
      height,
    };

    // Serialize updated data object
    const updatedDataString = JSON.stringify(imageData, null, 2);

    // Replace or append the updated data string into the file content
    if (
      fileContent.includes("export const data: Record<string, ImageData> = ")
    ) {
      // Replace existing data
      const newDataContentStart = fileContent.indexOf(
        "export const data: Record<string, ImageData> = "
      );
      const newDataContentEnd = fileContent.lastIndexOf(";");
      fileContent =
        fileContent.substring(0, newDataContentStart) +
        `export const data: Record<string, ImageData> = ${updatedDataString};` +
        fileContent.substring(newDataContentEnd + 1);
    } else {
      // Append new data
      fileContent += `export const data: Record<string, ImageData> = ${updatedDataString};`;
    }

    // Write the updated content back to the file
    await fs.writeFile(filePath, fileContent, "utf8");
  } catch (err) {
    console.log("❌ Error creating the iamge data:", err);
  }
};

export { createImageData };
