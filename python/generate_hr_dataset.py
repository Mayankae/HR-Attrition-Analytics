import numpy as np, pandas as pd
rng = np.random.default_rng(42); n = 2500
age = rng.integers(18, 61, n)
twy = np.minimum(35, ((age-18)*(.1+.85*rng.random(n))).astype(int))
lvl = np.clip(1+np.floor(twy/6+(rng.random(n)-.5)*2.2), 1, 5).astype(int)
base = np.array([0,3200,6200,9000,14000,18000])[lvl]
inc = np.clip(np.round(base+(rng.random(n)-.5)*3500+twy*40), 2000, 21000).astype(int)
dept = rng.choice(['Research & Development','Research & Development','Sales','Human Resources'], n)
roles = {'Research & Development':['Research Scientist','Laboratory Technician','Manufacturing Director','Research Director'],
         'Sales':['Sales Executive','Sales Representative','Manager'],'Human Resources':['Human Resources','Manager']}
role = [rng.choice(roles[d]) for d in dept]
ot = np.where(rng.random(n) < .3, 'Yes', 'No')
ms = rng.choice(['Single','Married','Married','Divorced'], n)
wlb = rng.integers(1, 5, n)
bt = rng.choice(['Travel_Rarely','Travel_Rarely','Travel_Frequently','Non-Travel'], n)
yac = np.minimum(twy, (rng.random(n)*rng.random(n)*20).astype(int))
yicr = (rng.random(n)*(yac+1)).astype(int)
z = (-1.6+1.3*(ot=='Yes')+.8*(ms=='Single')+.9*(lvl==1)+.5*(wlb==1)+.3*(bt=='Travel_Frequently')
     -.03*(age-35)-.00008*(inc-6000))
att = np.where(rng.random(n) < 1/(1+np.exp(-z)), 'Yes', 'No')
df = pd.DataFrame({'EmployeeID':[f'E{1001+i}' for i in range(n)],'Age':age,'Attrition':att,'BusinessTravel':bt,
 'Department':dept,'DistanceFromHome':rng.integers(1,30,n),
 'EducationField':rng.choice(['Life Sciences','Medical','Marketing','Technical Degree','Human Resources','Other'],n),
 'EnvironmentSatisfaction':rng.integers(1,5,n),'JobLevel':lvl,'JobRole':role,'JobSatisfaction':rng.integers(1,5,n),
 'MaritalStatus':ms,'MonthlyIncome':inc,'OverTime':ot,'PercentSalaryHike':rng.integers(11,26,n),
 'TotalWorkingYears':twy,'WorkLifeBalance':wlb,'YearsAtCompany':yac,'YearsInCurrentRole':yicr})
df.to_csv('HR_Employee_Attrition_2500.csv', index=False)
nom = {c: sorted(df[c].unique()) for c in df.select_dtypes('object') if c != 'EmployeeID'}
with open('HR_Employee_Attrition_2500.arff','w') as f:
    f.write('@relation HR_Employee_Attrition\n\n')
    for c in df.columns:
        if c == 'EmployeeID': f.write('@attribute EmployeeID string\n')
        elif c in nom: f.write('@attribute %s {%s}\n' % (c, ','.join("'%s'"%v if ' ' in v or '&' in v else v for v in nom[c])))
        else: f.write(f'@attribute {c} numeric\n')
    f.write('\n@data\n')
    for r in df.itertuples(index=False):
        f.write(','.join(("'%s'"%v if isinstance(v,str) and (' ' in v or '&' in v) else str(v)) for v in r)+'\n')
print(df.shape, 'attrition rate', (df.Attrition=='Yes').mean())
