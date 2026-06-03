/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createResource,
  deleteResource,
  getResources,
  updateResource,
} from "../services/resourceService";
import {
  MOCK_RESOURCES,
  getNextResourceId,
  normalizeResource,
  sortResources,
} from "../utils/resourceModule";

const ResourceContext = createContext(null);

export function ResourceProvider({ children }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiMode, setApiMode] = useState("live");
  const nextMockIdRef = useRef(getNextResourceId(MOCK_RESOURCES));

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getResources();
      const liveResources = sortResources((response ?? []).map(normalizeResource));
      setResources(liveResources);
      setApiMode("live");
      setError("");
      nextMockIdRef.current = getNextResourceId(liveResources);
    } catch {
      const fallbackResources = sortResources(MOCK_RESOURCES.map(normalizeResource));
      setResources(fallbackResources);
      setApiMode("mock");
      setError("Spring Boot API unavailable. Showing mock data.");
      nextMockIdRef.current = getNextResourceId(fallbackResources);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const createItem = useCallback(
    async (payload) => {
      const nextItem = normalizeResource(payload);

      if (apiMode === "live") {
        const createdItem = normalizeResource(await createResource(nextItem));
        setResources((current) => sortResources([...current, createdItem]));
        return createdItem;
      }

      const createdItem = { ...nextItem, id: nextMockIdRef.current++ };
      setResources((current) => sortResources([...current, createdItem]));
      return createdItem;
    },
    [apiMode]
  );

  const updateItem = useCallback(
    async (id, payload) => {
      const nextItem = normalizeResource({ ...payload, id });

      if (apiMode === "live") {
        const updatedItem = normalizeResource(await updateResource(id, nextItem));
        setResources((current) =>
          sortResources(current.map((item) => (item.id === id ? updatedItem : item)))
        );
        return updatedItem;
      }

      setResources((current) =>
        sortResources(current.map((item) => (item.id === id ? nextItem : item)))
      );
      return nextItem;
    },
    [apiMode]
  );

  const deleteItem = useCallback(
    async (id) => {
      if (apiMode === "live") {
        await deleteResource(id);
      }

      setResources((current) => current.filter((item) => item.id !== id));
    },
    [apiMode]
  );

  const value = useMemo(
    () => ({
      resources,
      loading,
      error,
      apiMode,
      reloadResources: loadResources,
      createResource: createItem,
      updateResource: updateItem,
      deleteResource: deleteItem,
    }),
    [apiMode, createItem, deleteItem, error, loadResources, loading, resources, updateItem]
  );

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
}

export function useResources() {
  const context = useContext(ResourceContext);

  if (!context) {
    throw new Error("useResources must be used within a ResourceProvider");
  }

  return context;
}
