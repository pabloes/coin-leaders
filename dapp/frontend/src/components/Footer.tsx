import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.scss';

const Footer: React.FC<{ tokens: any[], loading: boolean }> = ({ tokens, loading }) => {
    return (
        <footer className="footer">
            <div className="footer-content">
                {loading ? (
                    <p>Loading tokens...</p>
                ) : (
                    <div className="footer-tokens">
                        <p> More coins:
                        {tokens.map((token: any, index: number) => (
                            <span key={token.tokenAddress}>
                <Link to={`/token/${token.tokenAddress}`}>
                  {token.symbol}
                </Link>
                                {index < tokens.length - 1 ? ', ' : ''}
              </span>
                        ))} </p>
                    </div>
                )}
                <pre>(v0)</pre>
            </div>
        </footer>
    );
};

export default Footer;
