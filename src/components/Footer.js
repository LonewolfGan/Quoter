import { Link } from "react-router-dom";
import { Github, MessageCircle, Shield, FileText } from "lucide-react";
import logo from "../assets/logo/1.png";

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-black border-t-2 border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-12">
          {/* Logo et description */}
          <div className="flex-shrink-0 max-w-sm">
            <Link to="/" className="inline-block mb-4">
              <img src={logo} className="w-32 h-auto" alt="Quoter Logo" />
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Découvrez des citations inspirantes et des articles de réflexion
              pour nourrir votre esprit au quotidien.
            </p>
          </div>

          {/* Navigation et réseaux sociaux */}
          <div className="flex gap-16 md:gap-20">
            {/* Réseaux sociaux */}
            <div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                Suivez-nous
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://github.com/LonewolfGan"
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
                  >
                    <Github
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>Github</span>
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://discord.gg/4eeurUVvTy"
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
                  >
                    <MessageCircle
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>Discord</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                Légal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/privacy_policy"
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
                  >
                    <Shield
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>Confidentialité</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms_conditions"
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors group"
                  >
                    <FileText
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>Conditions</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
            © {new Date().getFullYear()}{" "}
            <Link
              to="/"
              className="font-semibold hover:text-black dark:hover:text-white transition-colors"
            >
              Quoter
            </Link>
            . Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
