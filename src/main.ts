import {
  getComponentsByName,
  useReactiveData,
  initializeComponents,
} from "../lib/component/component-v3";

initializeComponents();

const textComponents = getComponentsByName("text");
textComponents.forEach((component) => {
  const [counterValue, setCounterValue] = useReactiveData<number>(
    component,
    "counter"
  );
  console.log(counterValue());
  setInterval(() => {
    setCounterValue(counterValue() + 1);
    console.log(counterValue());
  }, 1000);
});

console.log(textComponents);
