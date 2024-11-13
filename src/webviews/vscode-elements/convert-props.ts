const lookup: Record<string, any> = {
  className: "class",
};

export function convertPropsToRegularHTMLAttributes(
  props: Record<string, any>
) {
  let convertedProps: Record<string, any> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key in lookup) {
      convertedProps[lookup[key]] = value;
    } else {
      convertedProps[key] = value;
    }
  }
  return convertedProps;
}
