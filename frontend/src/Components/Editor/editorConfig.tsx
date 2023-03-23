import exampleTheme from './ExampleTheme';

const editorConfig = {
  theme: exampleTheme,
  onError(error: any): never {
    throw error;
  },
};

export default editorConfig;
