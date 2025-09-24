import React, { useMemo } from "react";
import { Text, View } from "react-native";

export type Step = number;

type StepperProps = {
  step: Step; // index courant (0-based)
  steps: string[]; // libellés
  showLabels?: boolean;
  size?: number; // diamètre des pastilles
  thickness?: number; // épaisseur des connecteurs
  activeColor?: string;
  inactiveColor?: string;
};

function Stepper({
  step,
  steps,
  showLabels = false,
  size = 28,
  thickness = 2,
  activeColor = "#059669", // emerald-600
  inactiveColor = "#E5E7EB", // slate-200
}: StepperProps) {
  const clampedStep = useMemo(
    () => Math.max(0, Math.min(step, Math.max(steps.length - 1, 0))),
    [step, steps.length]
  );

  return (
    <View className="w-full">
      <View className="flex-row items-center px-5 py-3 border-b border-slate-200">
        {steps.map((label, i) => {
          const isActive = i <= clampedStep;
          const connectorActive = i < clampedStep;

          return (
            <React.Fragment key={`step-node-${i}`}>
              {/* Pastille (taille fixe) */}
              <View
                style={{
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: isActive ? activeColor : inactiveColor,
                }}
                className="items-center justify-center"
                accessibilityRole="summary"
                accessibilityLabel={`Étape ${i + 1} ${isActive ? "complétée" : "en attente"}`}
              >
                <Text
                  className="font-quicksand-bold"
                  style={{
                    fontSize: 12,
                    color: isActive ? "#ffffff" : "#475569", // slate-600
                  }}
                >
                  {i + 1}
                </Text>
              </View>

              {/* Connecteur (flex-1) entre pastilles, pas après la dernière */}
              {i < steps.length - 1 && (
                <View
                  className="mx-1"
                  style={{
                    flex: 1,
                    height: thickness,
                    backgroundColor: connectorActive
                      ? activeColor
                      : inactiveColor,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Libellés optionnels alignés sous chaque pastille */}
      {showLabels && (
        <View className="flex-row items-start px-5 mt-2">
          {steps.map((label, i) => {
            const isActive = i <= clampedStep;
            return (
              <React.Fragment key={`step-label-${i}`}>
                <View style={{ width: size }} className="items-center">
                  <Text
                    numberOfLines={1}
                    className={`${isActive ? "text-emerald-700" : "text-slate-500"} text-xs`}
                    style={{ textAlign: "center" }}
                  >
                    {label}
                  </Text>
                </View>
                {i < steps.length - 1 && <View style={{ flex: 1 }} />}
              </React.Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default Stepper;
