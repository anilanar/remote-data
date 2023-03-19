import type {
  Expand,
  GetStateFromSelectors,
  OutputSelector,
  SelectorArray,
  SelectorResultArray,
} from "./reselect-type-machinery";
import * as Q from "./query";

export interface CreateSelectorFunction {
  /** Input selectors as separate inline arguments */
  <Selectors extends SelectorArray, A, E>(
    ...items: [
      ...Selectors,
      (
        ...args: SelectorResultArray<Selectors>
      ) => Q.Query<A, E, GetStateFromSelectors<Selectors>>
    ]
  ): OutputSelector<Selectors, A, E>;

  //   /** Input selectors as a separate array */
  //   <Selectors extends SelectorArray, A, E>(
  //     selectors: [...Selectors],
  //     combiner: (
  //       ...args: SelectorResultArray<Selectors>
  //     ) => Q.Query<A, E, GetStateFromSelectors<Selectors>>
  //   ): OutputSelector<Selectors, A, E>;
}

export const createSelector = <Selectors extends SelectorArray, A, E>(
  ...args: [
    ...Selectors,
    (
      ...args: SelectorResultArray<Selectors>
    ) => Q.Query<A, E, GetStateFromSelectors<Selectors>>
  ]
) => {
  const selectors = args.slice(0, -1) as unknown as Selectors;
  const combiner = args[args.length - 1] as unknown as (
    ...args: SelectorResultArray<Selectors>
  ) => Q.Query<A, E, GetStateFromSelectors<Selectors>>;


};
