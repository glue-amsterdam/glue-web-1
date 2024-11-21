"use client";

import { use, useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { fetchPlans } from "@/utils/api";

type FormData = {
  plans: {
    planId: string;
    planLabel: string;
    planPrice: string;
    planType: string;
    planCurrency: string;
    currencyLogo: string;
    planDescription: string;
    planItems: { id: string; label: string }[];
  }[];
};

export default function ModifyPlansForm() {
  const initialPlans = use(fetchPlans());
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const { register, control, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: { plans: initialPlans.plans },
  });
  const { fields } = useFieldArray({
    control,
    name: "plans",
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log(data);
    // Here you would typically send the data to your API
    alert("Plans updated successfully!");
    setIsEditing({});
  };

  const toggleEditing = (planId: string) => {
    setIsEditing((prev) => ({ ...prev, [planId]: !prev[planId] }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {fields.map((plan, index) => (
        <div
          key={plan.id}
          className="bg-white shadow overflow-hidden sm:rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {plan.planLabel}
            </h3>
            <button
              type="button"
              onClick={() => toggleEditing(plan.planId)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isEditing[plan.planId] ? "Cancel" : "Edit"}
            </button>
          </div>
          {isEditing[plan.planId] ? (
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor={`plans.${index}.planLabel`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Plan Label
                </label>
                <input
                  type="text"
                  {...register(`plans.${index}.planLabel`)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor={`plans.${index}.planPrice`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Price
                </label>
                <input
                  type="text"
                  {...register(`plans.${index}.planPrice`)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor={`plans.${index}.planCurrency`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Currency
                </label>
                <input
                  type="text"
                  {...register(`plans.${index}.planCurrency`)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor={`plans.${index}.currencyLogo`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Currency Logo
                </label>
                <input
                  type="text"
                  {...register(`plans.${index}.currencyLogo`)}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-6">
                <label
                  htmlFor={`plans.${index}.planDescription`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  {...register(`plans.${index}.planDescription`)}
                  rows={3}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div className="sm:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Plan Items
                </label>
                {plan.planItems.map((item, itemIndex) => (
                  <div key={item.id} className="mt-1 flex items-center">
                    <input
                      type="text"
                      {...register(
                        `plans.${index}.planItems.${itemIndex}.label`
                      )}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updatedItems = [...plan.planItems];
                        updatedItems.splice(itemIndex, 1);
                        setValue(`plans.${index}.planItems`, updatedItems); // Fixing the error by using the correct path format
                      }}
                      className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newItem = { id: `new-${Date.now()}`, label: "" };
                    setValue(`plans.${index}.planItems`, [
                      ...plan.planItems,
                      newItem,
                    ]);
                  }}
                  className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Item
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {plan.planDescription}
              </p>
              <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                <div className="py-3 flex justify-between text-sm font-medium">
                  <dt className="text-gray-500">Price</dt>
                  <dd className="text-gray-900">
                    {plan.currencyLogo} {plan.planPrice} {plan.planCurrency}
                  </dd>
                </div>
                <div className="py-3 flex justify-between text-sm font-medium">
                  <dt className="text-gray-500">Type</dt>
                  <dd className="text-gray-900">{plan.planType}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Plan Items
                </h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {plan.planItems.map((item) => (
                    <li key={item.id} className="py-2 text-sm text-gray-500">
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-end">
        <button
          type="submit"
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
