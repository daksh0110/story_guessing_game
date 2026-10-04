const devConsole = {
  log: (...values: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log(...values);
    }
  },
};

export default devConsole;
