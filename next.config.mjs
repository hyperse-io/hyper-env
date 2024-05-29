console.log(`node_env:`, process.env.NODE_ENV);
console.log(`foo:`, process.env.NEXT_PUBLIC_FOO);

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 * @type {import("next").NextConfig}
 */
export default {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};
