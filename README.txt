DWM MINI PROJECT - Data Mining Analytics Dashboard
==================================================
RUN THE WEBSITE
  A) Double-click website/index.html   (works offline, no install)
  B) PyCharm: open this folder, right-click run_website.py > Run  -> http://localhost:8000
  C) Host online: upload the "website" folder to Netlify / GitHub Pages.

RUN THE PYTHON EXPERIMENTS (PyCharm)
  pip install pandas numpy scikit-learn matplotlib
  right-click python/dwm_analysis.py > Run   (Information Gain, Apriori-style rules, Tree vs Naive Bayes,
  regression, K-Means; plots saved in python/results)  - written for the HR dataset.

DATASETS (datasets/)
  HR_Employee_Attrition_2500.csv / .arff   main dataset (2,500 rows, 19 columns, target Attrition) - ARFF for WEKA
  HR_Employee_Attrition_sample_200.csv     small sample for quick tests
  Customer_Churn_dataset2.csv              2nd dataset (1,815 rows, has missing values, duplicates, outliers)
  Both are synthetic, generated for this assignment (python/generate_hr_dataset.py).

SHARING: see DEPLOY.md (standalone single file, Netlify, GitHub Pages, Start_Dashboard.bat for Windows).

DASHBOARD TABS
  Overview, Dataset Overview (rows/columns/missing values), Dataset Comparison (A vs B / previous), Dataset Reports (library of every analysed dataset),
  Warehouse & OLAP, Preprocessing (auto attribute detection, % changed), Association Rules, Classification
  (model comparison + per-model graphs), Regression, Clustering, Insights (comparative analytics),
  Data Explorer, What-if Predict.
  Upload any CSV with a yes/no style target column - attributes and target are detected automatically.
docs/ holds the original report and research paper.
