import { Routes, Route, Navigate } from "react-router-dom";
import routes from "@/routes";

function App() {
  return (
    <>
      <Routes>
        {routes.map(
          ({ path, element }, key) =>
            element && <Route key={key} exact path={path} element={element} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
