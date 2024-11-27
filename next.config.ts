module.exports = {
  experimental: {
    appDir: true, // Enable App Directory
  },
  async redirects() {
    return [
      {
        source: '/app/pages/:path*',
        destination: '/api/:path*',
        permanent: false,
      },
    ];
  },
};
