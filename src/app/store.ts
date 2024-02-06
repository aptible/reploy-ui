import { bootup } from "@app/bootup";
import {
  API_ACTION_PREFIX,
  Callable,
  Operation,
  PERSIST_LOADER_ID,
  configureStore,
  createBatchMdw,
  createLocalStorageAdapter,
  createPersistor,
  parallel,
  persistStoreMdw,
  take,
} from "@app/fx";
import {
  WebState,
  initialState as schemaInitialState,
  schema,
} from "@app/schema";
import { rootEntities, tasks } from "./packages";

export function setupStore({
  logs = true,
  initialState = {},
}: { logs?: boolean; initialState?: Partial<WebState> }) {
  const persistor = createPersistor<WebState>({
    adapter: createLocalStorageAdapter(),
    allowlist: ["theme", "nav", "redirectPath", "feedback", "resourceStats"],
  });

  const store = configureStore<WebState>({
    initialState: {
      ...schemaInitialState,
      entities: rootEntities,
      ...initialState,
    },
    middleware: [createBatchMdw(queueMicrotask), persistStoreMdw(persistor)],
  });

  const tsks: Callable<unknown>[] = [];
  if (logs) {
    tsks.push(function* logActions(): Operation<void> {
      while (true) {
        const action = yield* take("*");
        if (action.type === `${API_ACTION_PREFIX}store`) {
          continue;
        }
        console.log(action);
      }
    });
  }
  tsks.push(...tasks, bootup.run());

  store.run(function* (): Operation<void> {
    yield* persistor.rehydrate();
    yield* schema.update(schema.loaders.success({ id: PERSIST_LOADER_ID }));
    const group = yield* parallel(tsks);
    yield* group;
  });

  return store;
}

// persistor makes things more complicated for our tests so we are deliberately
// choosing to not include it for testing.
export function setupTestStore(initialState: Partial<WebState>) {
  const store = configureStore<WebState>({
    initialState: {
      ...schemaInitialState,
      entities: rootEntities,
      ...initialState,
    },
    middleware: [createBatchMdw(queueMicrotask)],
  });

  store.run(function* (): Operation<void> {
    const group = yield* parallel(tasks);
    yield* group;
  });

  return store;
}
