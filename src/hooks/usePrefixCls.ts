import { ConfigProvider } from "ant-design-vue";

import { useContext } from "./context";

export const usePrefixCls = (
  tag?: string,
  props?: {
    prefixCls?: string;
  }
) => {
  if ("ConfigContext" in ConfigProvider) {
    const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
    return getPrefixCls(tag, props?.prefixCls);
  } else {
    const prefix = props?.prefixCls ?? "ant-";
    return `${prefix}${tag ?? ""}`;
  }
};
