import React, { useEffect, useRef } from 'react';

let mermaid;

if (typeof window !== 'undefined') {
  // SSR güvenliği
  import('mermaid').then((mod) => {
    mermaid = mod.default;
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose', // güvenliğini artırmak için 'strict' yapabilirsin
    });
  });
}

const MermaidRenderer = ({ code }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!mermaid || !containerRef.current) return;

    const renderId = `mermaid-${Date.now()}`;

    // Tam HTML paint sonrası güvenli DOM erişimi
    setTimeout(() => {
      try {
        mermaid.render(renderId, code, (svgCode) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svgCode;
          }
        });
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre style="color:red;">Mermaid render hatası: ${err.message}</pre>`;
        }
      }
    }, 30); // 30ms gecikme ile hydration'dan sonra DOM'a erişiyoruz
  }, [code]);

  return <div className="mermaid-chart" ref={containerRef} />;
};

export default MermaidRenderer;
