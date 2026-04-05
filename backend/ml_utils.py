import numpy as np


def skills_to_1d(X):
    return np.asarray(X).ravel().astype(str)
