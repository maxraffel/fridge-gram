function Poop({ newNumber }: {newNumber: number}) {
    const obj = {
        a: 1,
        b: 2,
        c: 3,
    }

    const j = 1;
    return (
        <div>{j === newNumber && newNumber}
            <p>prepoop</p>
            <p>Poop</p>
        </div>
    )
}
export default Poop;