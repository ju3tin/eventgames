import Image from "next/image";
export default function footer() {
    return (
<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
<a
  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
  href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  target="_blank"
  rel="noopener noreferrer"
>
  <Image
    aria-hidden
    src="/file.svg"
    alt="File icon"
    width={16}
    height={16}
  />
  Learn
</a>
<a
  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
  href="https://github.com/ju3tin"
  target="_blank"
  rel="noopener noreferrer"
>
  <Image
    aria-hidden
    src="/images/github-mark/github-mark.svg"
    alt="Window icon"
    width={16}
    height={16}
  />
  @Ju3tin
</a>
<a
  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
  href="https://fitclash.vercel.app"
  target="_blank"
  rel="noopener noreferrer"
>
  <Image
    aria-hidden
    src="/globe.svg"
    alt="Globe icon"
    width={16}
    height={16}
  />
  Go to fitclash →
</a>
</footer>
)
}