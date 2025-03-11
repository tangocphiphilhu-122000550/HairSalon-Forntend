import React, { createContext, useState, useContext } from "react";

const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [newAppointmentCount, setNewAppointmentCount] = useState(0);

  return (
    <AppointmentContext.Provider value={{ newAppointmentCount, setNewAppointmentCount }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointmentContext = () => useContext(AppointmentContext);