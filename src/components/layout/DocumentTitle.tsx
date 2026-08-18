import { useEffect } from "react";

type DocumentTitleProps = {
  title: string;
};

export function DocumentTitle({ title }: DocumentTitleProps) {
  useEffect(() => {
    document.title = `${title} | Indian People's Forum UAE`;
  }, [title]);

  return null;
}
