import { createReactBlockSpec } from "@blocknote/react";
import { BlockNoteSchema } from "@blocknote/core";

export const ImageBlock = createReactBlockSpec(
  {
    type: "image",
    propSchema: {
      imageUrl: { default: "" },
      blockId: { default: "" },
    },
    content: "none",
  },
  {
    render: ({ block }) => {
      return (
        <div className="relative w-full">
          {block.props.imageUrl && (
            <img
              src={block.props.imageUrl}
              alt="Uploaded content"
              className="max-w-full h-auto"
            />
          )}
        </div>
      );
    },
  }
);

const schema = BlockNoteSchema.create({
  blockSpecs: {
    image: ImageBlock,
  },
});
