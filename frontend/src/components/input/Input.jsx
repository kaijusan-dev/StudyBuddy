import styles from './Input.module.css';

export default function Input({name, label, type, state, setState}) {
    return (
        <div className={styles.MyInput}>
            <label htmlFor={name}>{label}</label>
            <br />
            <input 
                type={type} 
                name={name} 
                id={name}
                label={label}
                value={state[name]}
                onChange={(e) => {
                    setState({...state, [name]: e.target.value})
                }}
            />
        </div>
    )
}