export function toAtLeastNDecimalPlaces(givennum, nofdecimal=2) {
    const normal_conv = givennum.toFixed(0).toString();
    const fixed_conv = givennum.toFixed(nofdecimal);
    return ( nofdecimal>0 ? fixed_conv : normal_conv);
}