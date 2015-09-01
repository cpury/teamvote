sitemaps.add('/sitemap.xml', function() {
  return [
    { page: '/', lastmod: new Date(), changefreq: 'daily' },
    { page: '/how-it-works/', lastmod: new Date(), changefreq: 'weekly' },
    { page: '/about/', lastmod: new Date(), changefreq: 'weekly' },
    { page: '/contact/', lastmod: new Date(), changefreq: 'weekly' },
  ];
});
