import { useEffect } from "react";
import { site } from "../../data/site";

type DocumentTitleProps = {
  title: string;
};

export function DocumentTitle({ title }: DocumentTitleProps) {
  useEffect(() => {
    document.title = `${title} | ${site.name}`;
  }, [title]);

  return null;
}
