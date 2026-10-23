import os
import json
import numpy as np
import scipy.signal as signal

# Ensure output goes directly into public/ folder
output_dir = os.path.join(os.path.dirname(__file__), "public")
os.makedirs(output_dir, exist_ok=True)
output_filepath = os.path.join(output_dir, "simulation_data.json")

# =====================================================================
# 1. BASELINE AIRCRAFT INPUT PARAMETERS (Business Jet)
# =====================================================================
m = 17347.9          # Mass (kg)
S = 50.3983          # Wing area (m^2)
b = 16.383           # Wingspan (m)
c_bar = 3.3315       # Mean aerodynamic chord (m)
Ix, Iy, Iz = 161032.4, 184211.2, 330142.7
Ixz = 6861.7
g = 9.80665
rho = 0.3016         # Air density at 40,000 ft
CL0, CD0 = 0.737, 0.095

W = m * g
U0 = np.sqrt((2 * W) / (rho * S * CL0))

# =====================================================================
# 2. STATE-SPACE MATRICES
# =====================================================================
Xu, Xa = -0.015, 1.5
Zu, Za, Zq = -0.1, -1.2, -0.1
Mu, Ma, Mq = 0.001, -0.5, -0.8
X_de, Z_de, M_de = 0.1, -0.2, -1.5

A_long = np.array([
    [Xu, Xa, 0, -g],
    [Zu/U0, Za/U0, 1 + Zq/U0, 0],
    [Mu, Ma, Mq, 0],
    [0, 0, 1, 0]
])
B_long = np.array([[X_de], [Z_de/U0], [M_de], [0]])

Yv, Yp, Yr = -0.1, 0.0, 0.0
Lv, Lp, Lr = -0.05, -1.5, 0.2
Nv, Np, Nr = 0.02, -0.1, -0.3
Y_da, Y_dr = 0.0, 0.05
L_da, L_dr = 1.2, 0.1
N_da, N_dr = -0.1, -0.5

A_lat = np.array([
    [Yv, 0, -1, g/U0, 0],
    [Lv, Lp, Lr, 0, 0],
    [Nv, Np, Nr, 0, 0],
    [0, 1, 0, 0, 0],   # phi dot = p
    [0, 0, 1, 0, 0]    # psi dot = r
])
B_lat = np.array([
    [Y_da, Y_dr],
    [L_da, L_dr],
    [N_da, N_dr],
    [0, 0],
    [0, 0]
])

# =====================================================================
# 3. SIMULATION & DATA PACKAGING USING scipy.signal.lsim
# =====================================================================
def simulate_mode(sys, initial_state, t_end, states_map, target_var):
    t = np.linspace(0, t_end, 600)
    
    # Free Response: Zero input (U = 0) with initial condition offset
    u_free = np.zeros_like(t)
    _, y_free, _ = signal.lsim(sys, U=u_free, T=t, X0=initial_state)
    
    # Step Response: 1 deg input applied at t = 1.0s with zero initial condition
    u_step = np.where(t >= 1.0, np.deg2rad(1.0), 0.0)
    _, y_step, _ = signal.lsim(sys, U=u_step, T=t, X0=np.zeros(sys.A.shape[0]))

    def format_output(y_data, is_lat=False):
        frames = []
        for i in range(len(t)):
            if not is_lat:
                pitch = y_data[i, 3]  # theta
                roll, yaw = 0.0, 0.0
                var_val = y_data[i, states_map[target_var]] * (180/np.pi) if target_var != 'u' else y_data[i, 0]
            else:
                pitch = 0.0
                roll = y_data[i, 3]   # phi
                yaw = y_data[i, 4]    # psi
                var_val = y_data[i, states_map[target_var]] * (180/np.pi)

            frames.append({
                "time": float(t[i]),
                "pitch": float(pitch),
                "roll": float(roll),
                "yaw": float(yaw),
                "varValue": float(var_val),
                "varName": target_var
            })
        return frames

    return {
        "free": format_output(y_free, is_lat=(sys.A.shape[0]==5)),
        "step": format_output(y_step, is_lat=(sys.A.shape[0]==5))
    }

sys_long = signal.StateSpace(A_long, B_long, np.eye(4), np.zeros((4, 1)))
sys_lat_da = signal.StateSpace(A_lat, B_lat[:, 0:1], np.eye(5), np.zeros((5, 1)))
sys_lat_dr = signal.StateSpace(A_lat, B_lat[:, 1:2], np.eye(5), np.zeros((5, 1)))

long_map = {'u': 0, 'alpha (deg)': 1, 'q (deg/s)': 2, 'theta (deg)': 3}
lat_map = {'beta (deg)': 0, 'p (deg/s)': 1, 'r (deg/s)': 2, 'phi (deg)': 3, 'psi (deg)': 4}

x0_long = [0, np.deg2rad(5), 0, 0]
x0_lat = [np.deg2rad(5), 0, 0, 0, 0]

data = {
    "short-period": simulate_mode(sys_long, x0_long, 10.0, long_map, 'alpha (deg)'),
    "phugoid": simulate_mode(sys_long, x0_long, 150.0, long_map, 'theta (deg)'),
    "dutch-roll": simulate_mode(sys_lat_dr, x0_lat, 30.0, lat_map, 'beta (deg)'),
    "roll-subsidence": simulate_mode(sys_lat_da, x0_lat, 10.0, lat_map, 'p (deg/s)'),
    "spiral": simulate_mode(sys_lat_da, x0_lat, 150.0, lat_map, 'phi (deg)')
}

with open(output_filepath, "w") as f:
    json.dump(data, f, indent=2)

print(f"Data successfully generated at: {output_filepath}")