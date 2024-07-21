import sharp from "sharp";

export const convertUnsupportedToJpeg = async (
  inputPath: string
): Promise<string> => {
  try {
    const outputPath = inputPath + "-converted.jpeg";
    await sharp(inputPath).toFormat("jpeg").toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error("❌ Error converting image to JPEG:", error);
    throw new Error("❌ Failed to convert image to JPEG.");
  }
};
