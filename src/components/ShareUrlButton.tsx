import { Button } from "./ui/button";

interface Props {
  children: string
}

export const ShareUrlButton = ({ children }: Props) => {
    const copyToClipboard = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href)
          .then(() => {
            alert('URL copied to clipboard!');
          })
          .catch((error) => {
            console.error('Failed to copy URL: ', error);
          });
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = window.location.href;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          alert('URL copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy URL: ', err);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    };
  
    return (
      <Button onClick={copyToClipboard} variant="ghost" className="mt-4 text-slate-400 font-unbounded">{children}</Button>
    );
  };
