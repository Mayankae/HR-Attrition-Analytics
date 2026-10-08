"""DWM Assignment 10 - HR Attrition: all experiments in Python (scikit-learn).
Install once:  pip install pandas numpy scikit-learn matplotlib
Run:           python dwm_analysis.py   (keep the CSV in data/ or next to this file)"""
import os, itertools
import numpy as np, pandas as pd
import matplotlib.pyplot as plt
from sklearn.feature_selection import mutual_info_classif
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, r2_score, mean_absolute_error

base = os.path.dirname(os.path.abspath(__file__))
path = next(p for p in [os.path.join(base, "data", "HR_Employee_Attrition_2500.csv"),
                        os.path.join(base, "HR_Employee_Attrition_2500.csv"),
                        os.path.join(base, "..", "datasets", "HR_Employee_Attrition_2500.csv")] if os.path.exists(p))
os.makedirs(os.path.join(base, "results"), exist_ok=True)
df = pd.read_csv(path).drop(columns=["EmployeeID"])          # preprocessing: drop identifier
print("Data shape:", df.shape, "| Attrition rate: %.1f%%" % (100 * (df.Attrition == "Yes").mean()))

# ---------- 1. Feature selection (Information Gain) ----------
CONT = ["Age", "DistanceFromHome", "MonthlyIncome", "PercentSalaryHike",
        "TotalWorkingYears", "YearsAtCompany", "YearsInCurrentRole"]
disc = df.copy()
for c in CONT:                                                # 3 equal-width bins, like WEKA Discretize
    disc[c] = pd.cut(df[c], 3, labels=["Low", "Mid", "High"]).astype(str)
X_enc = disc.drop(columns=["Attrition"]).astype(str).apply(LabelEncoder().fit_transform)
ig = pd.Series(mutual_info_classif(X_enc, df.Attrition, discrete_features=True, random_state=0) / np.log(2),
               index=X_enc.columns).sort_values(ascending=False)
print("\n=== Information Gain ranking ===\n", ig.round(4))
ig.sort_values().plot.barh(title="Information Gain (Attrition)", figsize=(7, 6))
plt.tight_layout(); plt.savefig(os.path.join(base, "results", "info_gain.png")); plt.show()

# ---------- 2. Association rules (Apriori style: pairs -> Attrition=Yes) ----------
MIN_SUP, MIN_CONF = 0.08, 0.60
items = pd.get_dummies(disc.drop(columns=["Attrition"]).astype(str), prefix_sep="=").astype(bool)
yes = (df.Attrition == "Yes").values
p_yes, n, rules = yes.mean(), len(df), []
cols = list(items.columns)
cand = [(c,) for c in cols] + [p for p in itertools.combinations(cols, 2) if p[0].split("=")[0] != p[1].split("=")[0]]
for a in cand:
    m = items[list(a)].all(axis=1).values
    if m.sum() == 0: continue
    sup, conf = (m & yes).sum() / n, (m & yes).sum() / m.sum()
    if sup >= MIN_SUP and conf >= MIN_CONF:
        rules.append((" AND ".join(a) + " => Attrition=Yes", round(sup, 3), round(conf, 3), round(conf / p_yes, 2)))
rules = pd.DataFrame(rules, columns=["Rule", "Support", "Confidence", "Lift"]).sort_values("Lift", ascending=False)
print("\n=== Top association rules ===\n", rules.head(10).to_string(index=False))

# ---------- 3. Classification: Decision Tree (J48-like) vs Naive Bayes ----------
dfe = df.copy()
for c in dfe.select_dtypes(exclude="number").columns:
    dfe[c] = LabelEncoder().fit_transform(dfe[c])
X, y = dfe.drop(columns=["Attrition"]), dfe["Attrition"]
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
models = {"Decision Tree": DecisionTreeClassifier(criterion="entropy", max_depth=5, min_samples_leaf=10, random_state=42),
          "Naive Bayes": GaussianNB()}
for name, mdl in models.items():
    pred = mdl.fit(Xtr, ytr).predict(Xte)
    print(f"\n=== {name} === accuracy = {accuracy_score(yte, pred):.3f}")
    print(classification_report(yte, pred, target_names=["No", "Yes"]))
    print("Confusion matrix:\n", confusion_matrix(yte, pred))
plt.figure(figsize=(16, 7))
plot_tree(models["Decision Tree"], feature_names=X.columns, class_names=["No", "Yes"], filled=True, max_depth=3, fontsize=7)
plt.savefig(os.path.join(base, "results", "decision_tree.png"), dpi=130); plt.show()

# ---------- 4. Regression ----------
for title, feats, target in [("Model 1", ["JobLevel", "TotalWorkingYears", "Age"], "MonthlyIncome"),
                             ("Model 2", ["Age", "TotalWorkingYears"], "YearsAtCompany")]:
    lr = LinearRegression().fit(df[feats], df[target]); p = lr.predict(df[feats])
    eq = " + ".join(f"{c:.2f}*{f}" for c, f in zip(lr.coef_, feats))
    print(f"\n=== {title}: {target} = {lr.intercept_:.2f} + {eq}\n R2 = {r2_score(df[target], p):.3f}  MAE = {mean_absolute_error(df[target], p):.2f}")
    if target == "MonthlyIncome":
        plt.figure(); plt.scatter(df.TotalWorkingYears, df[target], alpha=.3, label="Actual")
        plt.scatter(df.TotalWorkingYears, p, alpha=.4, c="r", label="Predicted"); plt.legend()
        plt.xlabel("Total Working Years"); plt.ylabel("Monthly Income"); plt.title("Regression")
        plt.savefig(os.path.join(base, "results", "regression.png")); plt.show()

# ---------- 5. Clustering (K-Means, K=3) ----------
F = ["Age", "MonthlyIncome", "TotalWorkingYears"]
km = KMeans(n_clusters=3, n_init=10, random_state=42).fit(StandardScaler().fit_transform(df[F]))
df["Cluster"] = km.labels_
order = df.groupby("Cluster").MonthlyIncome.mean().sort_values().index
df["Cluster"] = df.Cluster.map({old: new for new, old in enumerate(order)})
prof = df.groupby("Cluster").agg(Size=("Age", "size"), Age=("Age", "mean"), Income=("MonthlyIncome", "mean"),
                                 WorkYears=("TotalWorkingYears", "mean"),
                                 AttritionPct=("Attrition", lambda s: 100 * (s == "Yes").mean())).round(1)
print("\n=== Cluster profiles (0 = lowest income) ===\n", prof)
plt.figure(); plt.scatter(df.Age, df.MonthlyIncome, c=df.Cluster, alpha=.5)
plt.xlabel("Age"); plt.ylabel("Monthly Income"); plt.title("K-Means (K=3) Employee Segments")
plt.savefig(os.path.join(base, "results", "clusters.png")); plt.show()
