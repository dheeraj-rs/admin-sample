import { useContext } from 'react';
import { LayoutContext } from './context/LayoutContext';

const AppFooter = () => {
  const { layoutConfig } = useContext(LayoutContext);
  
  return (
    <div className="layout__footer">
      <div className="footer-brand">
        <img
          src={`/layout/logo-${layoutConfig.colorScheme === 'dark' ? 'dark' : 'white'}.svg`}
          alt="Logo"
        />
        <span>D-Admin</span>
        <span className="dashboard-text">Dashboard Analytics • ©</span>
        <span>{new Date().getFullYear()}</span>
      </div>
      <div className="footer-links">
        <a href="#">Help</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
    </div>
  );
};

export default AppFooter;