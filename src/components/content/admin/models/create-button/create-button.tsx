import { useState } from "react";
import { type Model, modelData } from "../..";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { FightsForm } from "./fights-form";
import { FightersForm } from "./fighters-form";
import { CardsForm } from "./cards-form";

type CreateModelButtonProps = ButtonProps & {
  model: Model;
};

const CreateModelButton = ({
  children,
  model,
  ...props
}: CreateModelButtonProps) => {
  const [open, setOpen] = useState(false);

  const { name } = modelData[model];

  const formJSX = {
    fights: <FightsForm name={name} setOpen={setOpen} />,
    fighters: <FightersForm name={name} setOpen={setOpen} />,
    cards: <CardsForm name={name} setOpen={setOpen} />,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...props}>{children}</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {name}</DialogTitle>
          <DialogDescription>
            Create a new {name} instance in the database.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full overflow-hidden px-1">{formJSX[model]}</div>
      </DialogContent>
    </Dialog>
  );
};

export { CreateModelButton };
