import {
  DefineComponent,
  VNode,
  UnwrapRef,
  InjectionKey,
  reactive,
  defineComponent,
  SetupContext,
  provide,
  readonly,
  inject,
} from "vue";

// 注入类型
export type ContextType<T> = any;
// 返回类型
export interface CreateContext<T> {
  Provider: DefineComponent<{}, () => VNode | VNode[] | undefined, any>;
  state: UnwrapRef<T> | T;
}
// 创建 Provider 和响应式数据绑定方法 (provider)
export const createContext = <T>(
  context: ContextType<T>,
  contextInjectKey: InjectionKey<ContextType<T>> = Symbol()
): CreateContext<T> => {
  const state = reactive<ContextType<T>>({
    ...context,
  });

  const ContextProvider = defineComponent({
    name: "ContextProvider",
    inheritAttrs: false,
    setup(props, { slots }: SetupContext) {
      // readonly 是为了防止被子组件修改状态
      provide(contextInjectKey, readonly(state));
      return () => slots.default?.();
    },
  });

  return {
    state,
    Provider: ContextProvider,
  };
};

// 使用 Provider 传递的属性 方法（inject）
export const useContext = <T>(
  contextInjectKey: InjectionKey<ContextType<T>> = Symbol(),
  defaultValue?: ContextType<T>
): T => {
  return readonly(inject(contextInjectKey, defaultValue || ({} as T)));
};
