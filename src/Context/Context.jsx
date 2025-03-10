import React, { createContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const MyContext = createContext({});

export const Context = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [viajes, setViajes] = useState([]);
  const [filtroDestino, setFiltroDestino] = useState('');
  const [filtroFecha, setFiltroFecha] = useState(null);
  const [mensajeEnviado, setMensajeEnviado] = useState(null);
  const [viajesOriginales, setViajesOriginales] = useState([]);
  

  const [resenas, setResenas] = useState({});
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://nautilus-prestiges.onrender.com/api/viajes"); 
        const data = await response.json();
        console.log(" Viajes cargados desde backend:", data);

        if (Array.isArray(data)) {
          setViajes(data);
          setViajesOriginales(data);
          console.log(" viajesOriginales cargados:", data);
        } else if (data.viajes && Array.isArray(data.viajes)) {
          setViajes(data.viajes); 
          setViajesOriginales(data.viajes);
          console.log(" viajesOriginales cargados:", data.viajes);
        } else {
          console.error(" Formato inesperado de viajes en la API:", data);
        }
      } catch (error) {
        console.error("Error al obtener los viajes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); 

  }, []); 

  useEffect(() => {
    setFiltroDestino(''); 
    setFiltroFecha(null); 
    setViajes(viajes); 
  }, [location]);

  
  const aplicarFiltros = () => {
    let filteredViajes = [...viajes];
    
    if (filtroDestino) {
      filteredViajes = filteredViajes.filter(viaje =>
        viaje.destino.some(destino =>
          destino.toLowerCase().includes(filtroDestino.toLowerCase()) 
        )
      );
    }

    if (filtroFecha) {
      filteredViajes = filteredViajes.filter(viaje =>
        new Date(viaje.fecha_salida) >= filtroFecha 
      );
    }

    setViajes(filteredViajes);
  };

  
  const actualizarFiltroDestino = (nuevoDestino) => {
    setFiltroDestino(nuevoDestino);
  };

  
  const actualizarFiltroFecha = (nuevaFecha) => {
    setFiltroFecha(nuevaFecha);
  };

  
  const resetFiltros = () => {
    console.log(" Ejecutando resetFiltros()");
    setFiltroDestino(""); 
    setFiltroFecha(null); 

   
    if (!Array.isArray(viajesOriginales) || viajesOriginales.length === 0) {
        console.warn(" No hay datos en viajesOriginales, recargando desde API...");
        
        fetch("https://nautilus-prestiges.onrender.com/api/viajes")
            .then(response => response.json())
            .then(data => {
                console.log(" Datos recargados desde API:", data);
                
                if (Array.isArray(data)) {
                    setViajes(data);
                    setViajesOriginales(data);  
                } else if (data.viajes && Array.isArray(data.viajes)) {
                    setViajes(data.viajes);
                    setViajesOriginales(data.viajes);
                } else {
                    console.error(" Formato inesperado de viajes en la API:", data);
                }
            })
            .catch(error => console.error(" Error al recuperar los viajes:", error));

        return; 
    }

    console.log("✅ Restaurando viajes desde viajesOriginales...");
    setViajes([...viajesOriginales]); 
};


 
  useEffect(() => {
    if (filtroDestino || filtroFecha) {
      aplicarFiltros();
    }
  }, [filtroDestino, filtroFecha]);


  useEffect(() => {
    console.log(" Detectando cambio de ruta en Context:", location.pathname);
    if (location.pathname === "/destinos") {  
      console.log("✅ Ejecutando resetFiltros en Context...");
      resetFiltros()
     
    }
  }, [location]);



  const enviarFormularioContacto = async (formData) => {
    try {
      const response = await fetch('https://nautilus-prestiges.onrender.com/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMensajeEnviado({ success: true, message: 'Mensaje enviado con éxito' });
      } else {
        setMensajeEnviado({ success: false, message: 'Error al enviar el mensaje' });
      }
    } catch (error) {
      setMensajeEnviado({ success: false, message: 'No se pudo enviar el mensaje, intenta nuevamente.' });
      console.error("Error al enviar el formulario de contacto:", error);
    }
  };

  const fetchResenasPorViaje = async (viajeId) => {
    console.log(`📍 Valor de viajeId recibido en fetchResenasPorViaje:`, viajeId);

    
    
    if (!viajeId || isNaN(viajeId)) {
      console.log("❌ No se recibió un viajeId en CardReseña.");
      return;
  }
    if (resenas[viajeId]) return; 

   

    const apiUrl = `https://nautilus-prestiges.onrender.com/api/resenas/viaje/${viajeId}`;
    console.log(` Intentando obtener: ${apiUrl}`);

    try {

      const response = await fetch(apiUrl);  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al obtener reseñas");
      }

      if (!Array.isArray(data.resenas)) {
        console.error("❌ Formato inesperado en las reseñas recibidas:", data);
        return;
    }


      console.log("📌 Reseñas recibidas del backend:", data.resenas);

      setResenas((prev) => ({
        ...prev,
        [viajeId]: data.resenas,
      }));
    } catch (error) {
      console.error("❌ Error al obtener reseñas:", error);
    }
  };

  const globalState = {
    
    loading,
    viajes,
    filtroDestino,
    filtroFecha,
    actualizarFiltroDestino,
    actualizarFiltroFecha,
    resenas,
    resetFiltros,
    enviarFormularioContacto, 
    mensajeEnviado,
    fetchResenasPorViaje
    

  };

  return (
    <MyContext.Provider value={globalState}
    >
      
      {children}
    </MyContext.Provider>
  );
};

export default MyContext;