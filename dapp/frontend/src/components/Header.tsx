import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const subs = [
    "Stake your claim on the leaderboard and show the world your impact.",
    "Contribute now and watch your name rise to the top.",
    "Be the hero the Web3 community needs\nmake your mark today.",
    "Leave your legacy on the leaderboard\nevery deposit counts.",
    "Make a difference while claiming your spot at the top.",
    "Don’t just watch\nlead by example and rise to the challenge.",
    "Your deposit is your voice\nmake it heard on the leaderboard.",
    "Help build the future of Web3, one deposit at a time.",
    "Turn your influence into action\nsecure your position now.",
    "Be the change you want to see\ncontribute and conquer.",
    "Climb the leaderboard and show everyone what you’re made of.",
    "Support innovation and let the leaderboard reflect your commitment.",
    "Make a name for yourself\nevery deposit takes you higher.",
    "Your contribution matters\nearn your place at the top.",
    "The leaderboard is waiting for you\nrise above the rest.",
    "Help shape the Web3 landscape and claim your rewards.",
    "Prove your dominance in the crypto space\ndeposit today.",
    "Be more than just a spectator\nlead the charge with your deposit.",
    "Show the world your commitment\nevery deposit counts.",
    "Don’t just be a part of the revolution\nlead it from the top.",
    "Show the world how big you have it",
    "Your deposit helps a Web3 developer continue creating innovative solutions\nmake a difference today.",
    "Contribute to the future of Web3 by supporting the developers who make it possible.",
    "Every deposit you make empowers a Web3 developer to keep building the decentralized future.",
    "Help drive the Web3 revolution by supporting the developers behind the technology.",
    "Your support today can fuel the creativity of a Web3 developer\nmake your deposit count.",
    "Join the fun\ndeposit and climb the leaderboard!",
    "Level up your game with a deposit\nit's time to shine!",
    "Make it fun\ndeposit and compete for the top spot!",
    "Have a blast\nrise to the top with your deposit!",
    "Where fun meets crypto\nmake your move and deposit now!"
];
const LineBreakComponent = ({ text }) => {
    // Split the text by newline and map it to JSX elements with <br /> tags
    const formattedText = text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            <br />
        </React.Fragment>
    ));

    return (
        <>
            {formattedText}
        </>
    );
};

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [sub, setSub] = useState("")
    useEffect(()=>{
        setSub(subs[getRandomInt(0, subs.length-1)])
    },[])
    return (
        <header className="header">
            <Link to="/" className="header">
                <div className="logo">
                        <img width={100} src="/highscore-logo.png" alt="Crown Logo" className="logo-img" />
                </div>
                <div className="title-container">
                    <h1 className="logo-title">coin-leaders</h1>
                    <p className="subtitle"><LineBreakComponent text={sub} /></p>
                </div>
            </Link>
            <div className="links">
            {/*    <a href="https://x.com/chainHighscore" target="_blank" rel="noopener noreferrer">Twitter</a>
                <Link to="/faqs">FAQs</Link>
                <Link to="/roadmap">Roadmap</Link>*/}
                <Link to="/referrer">Earn</Link>
           {/*     <Link to="/H1GH-token">$H1GH</Link>*/}
            </div>
            <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
                ☰
            </div>
            <nav className={`menu ${menuOpen ? 'open' : ''}`}>
                <Link className="menu-item" to="https://x.com/chainHighscore">Twitter</Link>
              {/*  <Link className="menu-item" to="https://discord.gg/uFeNSHxh">Discord</Link>*/}
  {/*              <Link className="menu-item" to="/H1GH-token">$H1GH</Link>*/}
                <Link className="menu-item" to="/faqs">FAQs</Link>
                <Link className="menu-item" to="/roadmap">Roadmap</Link>
                <Link className="menu-item" to="/referrer">Earn</Link>
            </nav>
        </header>
    );
};

export default Header;
