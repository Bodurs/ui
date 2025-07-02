import PropTypes from 'prop-types';
import React from 'react';
import { Card } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import MermaidIframe from './MermaidIframe';

const Messages = ({ message }) => {

  let image = '';
  /*if (message.type) {
    image = (
      <Link to="#" className="media-left photo-table">
        <img className="media-object img-radius img-radius m-t-5" src={photo} alt={name} />
      </Link>
    );
  }*/

  let msgClass = [];
  if (message.role !== 'user') {
    msgClass = [...msgClass, 'chat-menu-content'];
  } else {
    msgClass = [...msgClass, 'chat-menu-reply text-muted'];
  }

  let contentText = '';

  if (Array.isArray(message.content)) {
    contentText = message.content.map((c) => c.text).join('\n');
  } else if (typeof message.content === 'string') {
    contentText = message.content;
  } else if (typeof message.content === 'object' && message.content?.text) {
    contentText = message.content.text;
  } else {
    contentText = '[İçerik çözümlenemedi]';
  }

  return (
    <React.Fragment>
      <Card
        className="d-flex align-items-start shadow-none mb-0 p-0 chat-messages"
        style={{ flexDirection: 'row', backgroundColor: 'unset' }}
      >
        {image}
        <Card.Body className={msgClass.join(' ')} style={{ padding: '0px 10px 0px 10px' }}>
          <div className="">
            {message.role === 'assistant' ? (
              <div className="chat-cont">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const lang = className?.replace('language-', '');

                      const codeContent = String(children).trim();

                      // MERMAID ise özel bileşenle göster
                      if (lang === 'mermaid') {
                        return <MermaidIframe code={codeContent} />;
                      }

                      // Eğer içeriğin kendisi de bir Markdown ise (örneğin AI cevabı ``` içinde tüm markdown'ı döndürdüyse)
                      const isLikelyMarkdownBlock = codeContent.startsWith('#') || codeContent.includes('**') || codeContent.includes('- ') || codeContent.includes('```');

                      if (!inline && isLikelyMarkdownBlock) {
                        // Markdown kod bloğu içinde gelmiş → yeniden markdown olarak parse et
                        return (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {codeContent}
                          </ReactMarkdown>
                        );
                      }

                      // Normal kod bloğu
                      return (
                        <pre className={className}>
                          <code {...props}>{children}</code>
                        </pre>
                      );
                    }
                  }}
                >
                  {contentText}
                </ReactMarkdown>

              </div>
            ) : (
              <p className="chat-cont">{contentText}</p>
            )}
          </div>
          {/*<p className="chat-time">{message.time}</p>*/}
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

Messages.propTypes = {
  message: PropTypes.object,
  photo: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  msg: PropTypes.string,
  time: PropTypes.string
};

export default React.memo(Messages);
