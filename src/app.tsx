import { useSignal } from "@preact/signals";
import { z } from "zod";

const FormSchema = z.object({
  sectionToExtract: z.string().nonempty({
    message: "Section of URL to extract is required",
  }).url({
    message: "Section of URL to extract must be a valid URL",
  }).trim(),
  urlToExtractPath: z.string().nonempty({
    message: "URL to extract path is required",
  }).url({
    message: "URL to extract path must be a valid URL",
  }).trim(),
});

type FormValues = Partial<Record<keyof z.infer<typeof FormSchema>, string>>;

export function App() {
  const enableUrlInput = useSignal(false);
  const extractedPath = useSignal("");

  const errors = useSignal<
    FormValues
  >({
    sectionToExtract: undefined,
    urlToExtractPath: undefined,
  });

  const handleSectionToExtractChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const result = z.string().nonempty().safeParse(input.value.trim());

    enableUrlInput.value = result.success;
  };

  const handleSubmit = (event: Event) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);

    const result = FormSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
      errors.value = result.error.flatten().fieldErrors as FormValues;
      return;
    } else {
      errors.value = {
        sectionToExtract: undefined,
        urlToExtractPath: undefined,
      };
    }

    const { sectionToExtract, urlToExtractPath } = result.data;

    const sectionUrl = decodeURIComponent(sectionToExtract);
    const urlToExtractPathUrl = decodeURIComponent(urlToExtractPath);

    extractedPath.value = urlToExtractPathUrl
      .replace(sectionUrl, "")
      .split("/")
      .filter((path) => !path.endsWith(".mp4"))
      .join("/");
  };

  return (
    <>
      <div class="h-screen w-screen flex justify-center items-center">
        <div class="max-w-xl w-full p-4">
          <h1 class="text-2xl font-bold mb-4">Path Extractor</h1>
          <form onSubmit={handleSubmit}>
            <div class="flex flex-col gap-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">
                  Section of URL to extract:
                </legend>
                <input
                  type="text"
                  class="input input-primary w-full"
                  placeholder="Section of URL to extract"
                  onInput={handleSectionToExtractChange}
                  name="sectionToExtract"
                />
                {errors.value.sectionToExtract && (
                  <span class="text-error">
                    {errors.value.sectionToExtract[0]}
                  </span>
                )}
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">URL to extract Path:</legend>
                <input
                  type="text"
                  class={`input input-primary w-full ${
                    !enableUrlInput.value ? "input-disabled" : ""
                  }`}
                  placeholder=""
                  disabled={!enableUrlInput.value}
                  name="urlToExtractPath"
                />
                {errors.value.urlToExtractPath && (
                  <span class="text-error">
                    {errors.value.urlToExtractPath}
                  </span>
                )}
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Extracted Path:</legend>
                <div class="join w-full">
                  <input
                    type="text"
                    class="input input-primary join-item w-full"
                    placeholder=""
                    readOnly
                    value={extractedPath.value}
                  />
                  <button
                    type="button"
                    class="btn btn-secondary join-item"
                    disabled={extractedPath.value === ""}
                    onClick={() => {
                      navigator.clipboard.writeText(extractedPath.value);
                    }}
                  >
                    Copy
                  </button>
                </div>
              </fieldset>

              <button type="submit" class="btn btn-primary w-full">
                Extract
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
