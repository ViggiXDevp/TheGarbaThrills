import { Link } from 'react-router-dom';
import { UserCircle2, Heart, MessageCircle, Sparkles, Users, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import FestiveBackgroundArt from '../components/FestiveBackgroundArt';

const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScXaP6q0_gcj0K5UFWlH15kanWIpg1vIZmTEm24yOOC_BBJZw/viewform?usp=dialog';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="home-page">
      <FestiveBackgroundArt />
      <div className="home-card">
        <div className="home-greeting">
          <Sparkles size={18} className="home-greeting-icon" />
          <h1>Welcome, {user?.name}</h1>
        </div>
        <p className="subtitle">You're signed in to TheGarbaThrills.</p>

        <div className="home-menu">
          <Link to="/profile" className="home-menu-item">
            <span className="home-menu-icon">
              <UserCircle2 size={22} />
            </span>
            <span className="home-menu-text">
              <span className="home-menu-title">My Profile</span>
              <span className="home-menu-desc">View and edit your details</span>
            </span>
          </Link>

          <Link to="/swipe" className="home-menu-item">
            <span className="home-menu-icon">
              <Users size={22} />
            </span>
            <span className="home-menu-text">
              <span className="home-menu-title">Browse Profiles</span>
              <span className="home-menu-desc">Swipe & find your Garba partner</span>
            </span>
          </Link>

          <Link to="/likes" className="home-menu-item">
            <span className="home-menu-icon">
              <Heart size={22} />
            </span>
            <span className="home-menu-text">
              <span className="home-menu-title">Likes You</span>
              <span className="home-menu-desc">See who's already interested</span>
            </span>
          </Link>

          <Link to="/matches" className="home-menu-item">
            <span className="home-menu-icon">
              <MessageCircle size={22} />
            </span>
            <span className="home-menu-text">
              <span className="home-menu-title">Matches</span>
              <span className="home-menu-desc">People you've matched with</span>
            </span>
          </Link>

          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="home-menu-item"
          >
            <span className="home-menu-icon">
              <Star size={22} />
            </span>
            <span className="home-menu-text">
              <span className="home-menu-title">Feedback</span>
              <span className="home-menu-desc">Tell us about your experience</span>
            </span>
          </a>
        </div>

        <button onClick={logout}>Log out</button>
      </div>
    </div>
  );
};

export default Home;