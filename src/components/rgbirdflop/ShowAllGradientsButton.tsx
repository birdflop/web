import { component$, Signal } from "@qwik.dev/core";
import Eye from "lucide-icons-qwik/icons/Eye";

export const ShowAllGradientsButton = component$<{
  showAllGradients: Signal<boolean>;
}>((props) => {
  return (
    <button
      q:slot="extra-buttons"
      class={{
        "lum-btn rounded-l-sm p-1 transition-colors": true,
        "text-lum-primary": props.showAllGradients.value,
        "text-lum-text-secondary": !props.showAllGradients.value,
      }}
      onClick$={() =>
        (props.showAllGradients.value = !props.showAllGradients.value)
      }
      title={
        props.showAllGradients.value
          ? "Show only selected gradient"
          : "Show all gradients"
      }
    >
      <Eye size={20} />
    </button>
  );
});
