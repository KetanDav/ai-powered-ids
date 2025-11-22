import { createContext, useState } from "react";

export const IpContext = createContext();

export const IpProvider = ({ children }) => {
    const [latestIp, setLatestIp] = useState(null);

    return (
        <IpContext.Provider value={{ latestIp, setLatestIp }}>
            {children}
        </IpContext.Provider>
    );
};
