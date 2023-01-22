import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useReducer } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Switch } from "@headlessui/react";

import Footer from "../components/Footer";
import arrayToStringComma from "../utils/arrayToStringComma";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";

export interface Utensil {
  name: string;
  value: boolean;
}

export interface Utensils {
  oven: Utensil;
  microwave: Utensil;
  blender: Utensil;
  grill: Utensil;
}

const INITIAL_VALUES = {
  oven: { name: "Fogão", value: false },
  microwave: { name: "Microondas", value: false },
  blender: { name: "Liquidificador", value: false },
  grill: { name: "Churrasqueira", value: false },
};

const reducer = (
  state: Utensils,
  action: { type: string; payload: boolean }
) => {
  switch (action.type) {
    case "toggleOven":
      return {
        ...state,
        oven: {
          ...state.oven,
          value: action.payload,
        },
      };
    case "toggleMicrowave":
      return {
        ...state,
        microwave: {
          ...state.microwave,
          value: action.payload,
        },
      };
    case "toggleBlender":
      return {
        ...state,
        blender: {
          ...state.blender,
          value: action.payload,
        },
      };
    case "toggleGrill":
      return {
        ...state,
        grill: {
          ...state.grill,
          value: action.payload,
        },
      };
    default:
      return state;
  }
};

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useReducer(reducer, INITIAL_VALUES);

  const [ingredients, setIngredients] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<string>("");

  const handlePrompt = () => {
    const utensils = Object.entries(state)
      .filter(([, { value }]) => value)
      .map(([, { name }]) => name);

    const prompt = `Imagine que você é um chef mundialmente famoso. 
    Você é desafiado a criar uma receita de refeição seguindo rigorosamente estas regras. \n
    Você só pode usar os seguintes ingredientes: ${ingredients},
    Você deve usar apenas os ingredientes na lista fornecida. Nenhum outro ingrediente pode ser usado.
    Você só pode usar os seguintes utensílios de cozinha para criar sua receita: ${arrayToStringComma(
      utensils
    )}.
    Suponha que a receita deva ser preparada por uma pessoa comum que não seja um chef experiente.
    No final da receita, liste claramente os macronutrientes da receita.
    Sua resposta deve rotular claramente com \"Nome da receita\", \"Ingredientes\", \"Dificuldade\", \"Tempo de cozimento\", \"Ferramentas necessárias\", \"Instruções\", \"Macronutrientes\"."`;

    return prompt;
  };

  const generateRecipe = async (e: any) => {
    e.preventDefault();

    setGeneratedRecipe("");
    setLoading(true);

    const prompt = handlePrompt();

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();

    let done = false;
    let tempState = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const newValue = decoder
        .decode(value)
        .replaceAll("data: ", "")
        .split("\n\n")
        .filter(Boolean);

      if (tempState) {
        newValue[0] = tempState + newValue[0];
        tempState = "";
      }

      newValue.forEach((newVal) => {
        if (newVal === "[DONE]") {
          return;
        }

        try {
          const json = JSON.parse(newVal) as {
            id: string;
            object: string;
            created: number;
            choices?: {
              text: string;
              index: number;
              logprobs: null;
              finish_reason: null | string;
            }[];
            model: string;
          };

          if (!json.choices?.length) {
            throw new Error("Something went wrong.");
          }

          const choice = json.choices[0];
          setGeneratedRecipe((prev) => prev + choice.text);
        } catch (error) {
          tempState = newVal;
        }
      });
    }

    // setGeneratedRecipe()

    setLoading(false);
  };

  return (
    <div className="flex mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Head>
        <title>Gerador de Receitas</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* <Header /> */}

      <main className="flex max-w-5xl flex-1 w-full flex-col items-center justify-center text-center px-4 mt-16">
        <h1 className="text-2xl lg:text-4xl max-w-2xl font-bold text-slate-900">
          Gere sua receita com base em ingredientes que você tem em casa.
        </h1>
        {/* <p className="text-slate-500 mt-5">18,167 receitas geradas até agora.</p> */}
        <div className="max-w-xl">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />

            <div>
              <p className="text-left font-medium">
                Descreva os ingredientes que você tem.
              </p>
              <span className="text-slate-500">
                (adicione a quantidade de cada ingrediente para um resultado
                melhor)
              </span>
            </div>
          </div>

          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={"ex: 100g de Manteiga, 200ml de Leite..."}
          />

          <div className="flex mb-6 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">
              Selecione que itens de cozinha você tem:
            </p>
          </div>

          <div className="block mb-4">
            <Switch.Group>
              <div className="flex items-center justify-between">
                <Switch.Label className="mr-4">Fogão</Switch.Label>
                <Switch
                  checked={state.oven.value}
                  onChange={(value: boolean) =>
                    dispatch({ payload: value, type: "toggleOven" })
                  }
                  className={`${
                    state.oven.value ? "bg-black" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      state.oven.value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </Switch.Group>
          </div>

          <div className="block mb-4">
            <Switch.Group>
              <div className="flex items-center justify-between">
                <Switch.Label className="mr-4">Microondas</Switch.Label>
                <Switch
                  checked={state.microwave.value}
                  onChange={(value: boolean) =>
                    dispatch({ payload: value, type: "toggleMicrowave" })
                  }
                  className={`${
                    state.microwave.value ? "bg-black" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      state.microwave.value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </Switch.Group>
          </div>

          <div className="block mb-4">
            <Switch.Group>
              <div className="flex items-center justify-between">
                <Switch.Label className="mr-4">Liquidificador</Switch.Label>
                <Switch
                  checked={state.blender.value}
                  onChange={(value: boolean) =>
                    dispatch({ payload: value, type: "toggleBlender" })
                  }
                  className={`${
                    state.blender.value ? "bg-black" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      state.blender.value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </Switch.Group>
          </div>

          <div className="block mb-4">
            <Switch.Group>
              <div className="flex items-center justify-between">
                <Switch.Label className="mr-4">Churrasqueira</Switch.Label>
                <Switch
                  checked={state.grill.value}
                  onChange={(value: boolean) =>
                    dispatch({ payload: value, type: "toggleGrill" })
                  }
                  className={`${
                    state.grill.value ? "bg-black" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      state.grill.value ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
              </div>
            </Switch.Group>
          </div>

          {!loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 mt-6 hover:bg-black/80 w-full"
              onClick={(e) => generateRecipe(e)}
            >
              Gere sua receita &rarr;
            </button>
          )}
          {loading && (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 mt-6 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          )}
        </div>

        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />

        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
      </main>

      <ResizablePanel>
        <AnimatePresence mode="wait">
          <motion.div className="my-10">
            {/* {generatedRecipe && !loading && ( */}
            {generatedRecipe && (
              <div className="space-y-8 flex flex-1 w-full flex-col items-center justify-center">
                <h2 className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto text-center">
                  Sua receita gerada
                </h2>

                <div className="flex max-w-xl mx-auto">
                  <div
                    className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedRecipe);
                      toast("Receita copiada", {
                        icon: "✂️",
                      });
                    }}
                  >
                    {/* <p>{generatedRecipe}</p> */}

                    {generatedRecipe.split(/\n/).map((str, index) => (
                      <p key={index}>{str}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </ResizablePanel>
      <Footer />
    </div>
  );
};

export default Home;
