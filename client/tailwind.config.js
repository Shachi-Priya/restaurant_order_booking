module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        by: {
          bg: "#0B0E13",          // deep ink
          card: "#0F1520",        // card surface
          soft: "#161D2A",        // section surface
          text: "#E6EAF2",        // primary text
          sub: "#A5B0C0",         // secondary text
          y: "#F6D365",           // brand yellow
          y2: "#FDA085"           // warm accent (for hover/gradients)
        }
      },
      boxShadow: {
        float: "0 10px 24px rgba(0,0,0,.35)",
        ring: "0 0 0 1px rgba(246, 211, 101, .25), 0 8px 22px rgba(0,0,0,.35)"
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem"
      }
    }
  },
  plugins: []
};
