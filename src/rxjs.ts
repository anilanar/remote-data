import {Observable} from 'rxjs'

type Stream<A> = {
    value: A;
    observable: Observable<A>;
};
