import os
import json
import numpy as np
import scipy.signal as signal
import scipy.linalg as linalg

# Ensure output directory exists
output_dir = os.path.join(os.path.dirname(__file__), "public")
os.makedirs(output_dir, exist_ok=True)
output_filepath = os.path.join(output_dir, "simulation_data.json")

# =====================================================================
# 1. BASELINE AIRCRAFT INPUT PARAMETERS
# =====================================================================
m       = 17347.9         # Mass (kg)
S       = 50.3983         # Wing area (m^2)
b       = 16.383          # Wingspan (m)
c_bar   = 3.3315          # Mean aerodynamic chord (m)
Ix      = 161032.43       # Roll inertia (kg*m^2)
Iy      = 184211.19       # Pitch inertia (kg*m^2)
Iz      = 330142.72       # Yaw inertia (kg*m^2)
Ixz     = 6861.7104       # Product of inertia (kg*m^2)
g       = 9.80665         # Acceleration due to gravity (m/s^2)

# Trim Flight Condition (40,000 ft ISA)
rho     = 0.3016          # Density (kg/m^3) at 40,000 ft
a_sound = 295.07          # Speed of sound (m/s)
CL0     = 0.737           # Trim Lift Coefficient
CD0     = 0.095           # Trim Drag Coefficient
theta0  = 0.0             # Trim pitch angle (rad)

W       = m * g                              # Weight (N)
U0      = np.sqrt((2 * W) / (rho * S * CL0))   # Trim velocity (m/s)
q0      = 0.5 * rho * (U0**2)                # Dynamic pressure (Pa)
M0      = U0 / a_sound                      # Cruise Mach number

# Longitudinal Stability Derivatives
C_L_a,     C_D_a,     C_m_a     = 5.0, 0.75, -0.8
C_L_adot,  C_D_adot,  C_m_adot  = 0.0, 0.0, -3.0
C_L_q,     C_D_q,     C_m_q     = 0.0, 0.0, -8.0
C_L_M,     C_D_M,     C_m_M     = 0.0, 0.0, -0.05
C_L_de,    C_D_de,    C_m_de    = 0.4, 0.0, -0.81

C_D_u = M0 * C_D_M
C_L_u = M0 * C_L_M
C_m_u = M0 * C_m_M

Xu     = -(C_D_u + 2 * CD0) * q0 * S / (m * U0)
Xa     = (CL0 - C_D_a) * q0 * S / m
Zu     = -(C_L_u + 2 * CL0) * q0 * S / (m * U0)
Za     = -(C_L_a + CD0) * q0 * S / m
Z_adot = -C_L_adot * (c_bar / (2 * U0)) * (q0 * S / m)
Zq     = -C_L_q * (c_bar / (2 * U0)) * (q0 * S / m)
Mu     = C_m_u * (q0 * S * c_bar / (Iy * U0))
Ma     = C_m_a * (q0 * S * c_bar / Iy)
M_adot = C_m_adot * (c_bar / (2 * U0)) * (q0 * S * c_bar / Iy)
Mq     = C_m_q * (c_bar / (2 * U0)) * (q0 * S * c_bar / Iy)

X_de   = -C_D_de * q0 * S / m
Z_de   = -C_L_de * q0 * S / m
M_de   = C_m_de * q0 * S * c_bar / Iy

den    = U0 - Z_adot

# 4x4 Longitudinal System: [u, alpha, q, theta]
A_long = np.array([
    [Xu, Xa, 0, -g * np.cos(theta0)],
    [Zu/den, Za/den, (U0 + Zq)/den, -(g * np.sin(theta0))/den],
    [Mu + M_adot*(Zu/den), Ma + M_adot*(Za/den), Mq + M_adot*((U0 + Zq)/den), -M_adot*g*np.sin(theta0)/den],
    [0, 0, 1, 0]
])
B_long = np.array([
    [X_de],
    [Z_de/den],
    [M_de + M_adot*(Z_de/den)],
    [0]
])

# Lateral-Directional Stability Derivatives
Cy_beta, Cl_beta, Cn_beta = -0.720, -0.103, 0.137
Cy_p,    Cl_p,    Cn_p    = 0.0,    -0.37,  -0.14
Cy_r,    Clr,     Cnr     = 0.0,    0.11,   -0.16
Cy_da,   Cl_da,   Cn_da   = 0.0,    0.054,  -0.0075
Cy_dr,   Cl_dr,   Cn_dr   = 0.175,  0.029,  -0.063

gamma  = Ix * Iz - (Ixz**2)
gamma3 = Iz / gamma
gamma4 = Ixz / gamma
gamma8 = Ix / gamma

Y_beta = (q0 * S / m) * Cy_beta
Y_p    = (q0 * S * b / (2 * m * U0)) * Cy_p
Y_r    = (q0 * S * b / (2 * m * U0)) * Cy_r
L_beta = q0 * S * b * Cl_beta
L_p    = (q0 * S * (b**2) / (2 * U0)) * Cl_p
L_r    = (q0 * S * (b**2) / (2 * U0)) * Clr
N_beta = q0 * S * b * Cn_beta
N_p    = (q0 * S * (b**2) / (2 * U0)) * Cn_p
N_r    = (q0 * S * (b**2) / (2 * U0)) * Cnr

Y_da, Y_dr = (q0 * S / m) * Cy_da, (q0 * S / m) * Cy_dr
L_da, L_dr = q0 * S * b * Cl_da,   q0 * S * b * Cl_dr
N_da, N_dr = q0 * S * b * Cn_da,   q0 * S * b * Cn_dr

L_prime_beta = gamma3 * L_beta + gamma4 * N_beta
N_prime_beta = gamma4 * L_beta + gamma8 * N_beta
L_prime_p    = gamma3 * L_p + gamma4 * N_p
N_prime_p    = gamma4 * L_p + gamma8 * N_p
L_prime_r    = gamma3 * L_r + gamma4 * N_r
N_prime_r    = gamma4 * L_r + gamma8 * N_r

L_prime_da = gamma3 * L_da + gamma4 * N_da
N_prime_da = gamma4 * L_da + gamma8 * N_da
L_prime_dr = gamma3 * L_dr + gamma4 * N_dr
N_prime_dr = gamma4 * L_dr + gamma8 * N_dr

# 4x4 Lateral System: [beta, p, r, phi]
A_lat4 = np.array([
    [Y_beta/U0, Y_p/U0, -(1 - Y_r/U0), (g*np.cos(theta0))/U0],
    [L_prime_beta, L_prime_p, L_prime_r, 0],
    [N_prime_beta, N_prime_p, N_prime_r, 0],
    [0, 1, 0, 0]
])
B_lat4 = np.array([
    [Y_da/U0, Y_dr/U0],
    [L_prime_da, L_prime_dr],
    [N_prime_da, N_prime_dr],
    [0, 0]
])

# Complete System Matrix (Unapproximated Full 8x8)
# States: [u, alpha, q, theta, beta, p, r, phi]
A_comp = np.block([
    [A_long, np.zeros((4, 4))],
    [np.zeros((4, 4)), A_lat4]
])
B_comp = np.block([
    [B_long, np.zeros((4, 2))],
    [np.zeros((4, 1)), B_lat4]
])

# Reduced Subsystem Matrices
A_sp = np.array([
    [Za/den, (U0 + Zq)/den],
    [Ma + M_adot*(Za/den), Mq + M_adot*((U0 + Zq)/den)]
])
B_sp = np.array([[Z_de/den], [M_de + M_adot*(Z_de/den)]])

A_ph = np.array([
    [Xu, -g*np.cos(theta0)],
    [-Zu/U0, 0]
])
B_ph = np.array([[X_de], [-Z_de/U0]])

A_dr = np.array([
    [Y_beta/U0, -(1 - Y_r/U0)],
    [N_prime_beta, N_prime_r]
])
B_dr = np.array([[Y_dr/U0], [N_prime_dr]])

A_rs = np.array([[L_prime_p]])
B_rs = np.array([[L_prime_da]])

A_spir = np.array([
    [0, 1.0],
    [(g/U0)*(N_prime_beta*L_prime_p - N_prime_p*L_prime_beta)/max(abs(L_prime_p), 1e-6), N_prime_r - (N_prime_beta*L_prime_r)/max(abs(L_prime_beta), 1e-6)]
])
B_spir = np.array([[0.0], [N_prime_dr]])

# =====================================================================
# 2. SIMULATION & DATA PACKAGING (0 to 350s)
# =====================================================================
t = np.arange(0.0, 350.0 + 0.05, 0.1)

def run_simulation(A, B, x0_free, u_step_val, var_names, orientation_builder):
    n_states = A.shape[0]
    n_inputs = B.shape[1] if B.ndim > 1 else 1
    
    # Free Response (Control = 0, IC != 0)
    sys_free = signal.StateSpace(A, np.zeros((n_states, 1)), np.eye(n_states), np.zeros((n_states, 1)))
    _, y_free, _ = signal.lsim(sys_free, U=np.zeros((len(t), 1)), T=t, X0=x0_free)
    
    # Step Response (Control = 1 deg step, IC = 0)
    sys_step = signal.StateSpace(A, B, np.eye(n_states), np.zeros((n_states, n_inputs)))
    U_step = np.ones((len(t), n_inputs)) * u_step_val if n_inputs > 1 else np.ones((len(t), 1)) * u_step_val
    _, y_step, _ = signal.lsim(sys_step, U=U_step, T=t, X0=np.zeros(n_states))
    
    def process_frames(y_data):
        frames = []
        for i in range(len(t)):
            row = y_data[i] if n_states > 1 else [y_data[i]]
            state_dict = {}
            for idx_v, v_name in enumerate(var_names):
                val = float(row[idx_v])
                if '(deg)' in v_name or '(deg/s)' in v_name:
                    val = float(np.rad2deg(val))
                state_dict[v_name] = round(val, 6)
            
            pitch_deg, roll_deg, yaw_deg = orientation_builder(state_dict)
            
            frames.append({
                "time": round(float(t[i]), 1),
                "pitch": round(float(pitch_deg), 4),
                "roll": round(float(roll_deg), 4),
                "yaw": round(float(yaw_deg), 4),
                "states": state_dict
            })
        return frames

    return {
        "free": process_frames(y_free),
        "step": process_frames(y_step)
    }

# Dynamic Simulations
gust_5deg = np.deg2rad(5.0)
step_1deg = np.deg2rad(1.0)

comp_vars = ["u (m/s)", "alpha (deg)", "q (deg/s)", "theta (deg)", "beta (deg)", "p (deg/s)", "r (deg/s)", "phi (deg)"]

data = {
    "short-period": {
        "variables": ["alpha (deg)", "q (deg/s)"],
        **run_simulation(A_sp, B_sp, [gust_5deg, 0], step_1deg, ["alpha (deg)", "q (deg/s)"], lambda s: (s["alpha (deg)"], 0.0, 0.0))
    },
    "phugoid": {
        "variables": ["u (m/s)", "theta (deg)"],
        **run_simulation(A_ph, B_ph, [5.0, np.deg2rad(2.0)], step_1deg, ["u (m/s)", "theta (deg)"], lambda s: (s["theta (deg)"], 0.0, 0.0))
    },
    "dutch-roll": {
        "variables": ["beta (deg)", "r (deg/s)"],
        **run_simulation(A_dr, B_dr, [gust_5deg, 0], step_1deg, ["beta (deg)", "r (deg/s)"], lambda s: (0.0, 0.0, s["beta (deg)"]))
    },
    "roll-subsidence": {
        "variables": ["p (deg/s)"],
        **run_simulation(A_rs, B_rs, [gust_5deg], step_1deg, ["p (deg/s)"], lambda s: (0.0, s["p (deg/s)"], 0.0))
    },
    "spiral": {
        "variables": ["phi (deg)", "r (deg/s)"],
        **run_simulation(A_spir, B_spir, [gust_5deg, 0], step_1deg, ["phi (deg)", "r (deg/s)"], lambda s: (0.0, s["phi (deg)"], 0.0))
    },
    "complete": {
        "variables": comp_vars,
        **run_simulation(A_comp, B_comp, [0, gust_5deg, 0, 0, 0, 0, 0, 0], step_1deg, comp_vars, lambda s: (s["theta (deg)"], s["phi (deg)"], s["beta (deg)"]))
    }
}

with open(output_filepath, "w") as f:
    json.dump(data, f, indent=2)

print(f"Dataset compiled up to 350.0s at {output_filepath}")