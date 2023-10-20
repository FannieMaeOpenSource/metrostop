import SystemContext from './CreateSystemContext/CreateSystemContext.js';

// const allExtensions = {
//   SystemContext,
// };
const extensions = {
  SystemContext,
};

// const SetExtensions = (localExtensions) => {
//   extensions = localExtensions.reduce((acc, extension) => {
//     acc[extension] = allExtensions[extension];
//     return acc;
//   }, {});
// };
// const SetExtension = (localExtension) => {
//   extensions[localExtension] = allExtensions[localExtension];
// };
const RenderExtension = (name, values) => {
  extensions[name].Render(values);
};
const ResetExtensions = () => {
  Object.keys(extensions).forEach((extension) => extensions[extension].Reset());
};

export {
  RenderExtension, ResetExtensions,
};
