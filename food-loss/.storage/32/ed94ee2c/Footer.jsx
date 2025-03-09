import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} 食材ロス削減献立アプリ
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <a href="#" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
              プライバシーポリシー
            </a>
            <a href="#" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
              利用規約
            </a>
            <a href="#" className="text-gray-600 hover:text-green-600 text-sm transition-colors">
              お問い合わせ
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>食品廃棄を減らし、地球環境に優しい食生活を</p>
          <p className="mt-1">楽天レシピAPIを使用しています</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
