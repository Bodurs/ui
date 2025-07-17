import React, { useEffect, useRef } from 'react';

const MermaidIframe = ({ code }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
      </head>
      <body>
        <div className="mermaid">${code}</div>
        <script>
          mermaid.initialize({ startOnLoad: true });
        </script>
      </body>
      </html>
    `);
    doc.close();
  }, [code]);

  return (
    <iframe
      ref={iframeRef}
      title="Mermaid Diagram"
      style={{
        width: '100%',
        border: 'none',
        height: '300px', // ihtiyaca göre dinamik yapılabilir
      }}
    />
  );
};

export default MermaidIframe;
