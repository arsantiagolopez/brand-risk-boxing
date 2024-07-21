import { data } from "@/data/images/data";
import NextImage from "next/image";

type ImageProps = {
  image: string;
  alt: string;
  className?: string;
};

const Image = ({ image, alt, className }: ImageProps) => {
  const { blurDataURL, width, height } = data[image] || {};

  const placeholder = blurDataURL ? "blur" : "empty";

  return (
    <NextImage
      src={image}
      alt={alt}
      width={width || 400}
      height={height || 400}
      blurDataURL={blurDataURL}
      placeholder={placeholder}
      className={className}
    />
  );
};

export { Image };
