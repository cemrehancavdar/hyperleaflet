function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep(target, source) {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!isObject(target[key])) Object.assign(output, { [key]: source[key] });
        else if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeDeep(target[key], source[key]);
      } else if (isObject(source)) {
        output[key] = source[key];
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}
