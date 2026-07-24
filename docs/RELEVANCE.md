# Developing a Relevance Metric for Vibrant Grants

Prepared for New Sun Rising
by the MHCI 2026 Capstone Team
of Carnegie Mellon University

Daniel "Ludo" DeAnda (Author), Soyon Kim,
Anissa Patel, Priyal Shrivastava, and Cameron Thompson

> [!WARNING] Technical details ahead!
> This document is intended for software engineers responsible for the implementation and maintenance of Vibrant Grants, as well as user experience researchers interested in fine-tuning the relevance metric's hyperparameters. If you're not yet familiar with the Vibrant Grants relevance metric or are looking for a non-technical overview, take a look at the main Vibrant Grants design report first.

## Executive Summary

To ensure that users always encounter promising grant opportunities at the top of their search results, we designed a formula that numerically estimates how relevant a grant is to an organization based on 13 heuristic factors. Not every factor is equally impactful when assessing relevance, so our formula also considers 21 hyperparameters that can be fine-tuned over time. To kick-start that refinement process, we consulted with 10 subject matter experts and chose an initial value for each hyperparameter based on our findings.

## Factors and Formulae

### Factors 1-4: Grantor History

These factors evaluate the extent to which the grantor $G$ of the some grant is relevant to the some user $u$.

Let $U$ represent the set of all users. Additionally, let $w(G,x)$ be the number of times that some user $x$ has successfully received a grant from $G$ and $a(G,x)$ be the number of times that $x$ has applied for a grant from $G$.

We may then conjecture that the relevance of $G$ to $u$ correlates at least somewhat with each of the following:

- $w(G,u)$
- $a(G,u)$
- $\sum_{v \in (U-\{u\})}w(G,v)$
- $\sum_{v \in (U-\{u\})}a(G,v)$

We may further conjecture that the degree to which the grantor history of some non-$u$ user $v$ is relevant to $u$ depends in part (but not necessarily in whole) on the percentage of issues that $u$ and $v$ have in common. Let $i(u,v$) be that percentage. We may then expand upon the final two expressions in the previous list as follows:

- $\sum_{v \in (U-\{u\})}(w(G,v)*i(u,v))$
- $\sum_{v \in (U-\{u\})}(a(G,v)*i(u,v))$

We might reasonably prefer that the existence of *any* issue overlap be valued more highly than the presence of *perfect* issue overlap. To achieve this, we may further refine the previous two expressions as follows (let $p_1,p_2$ be real numbers greater than $1$):

- $\sum_{v \in (U-\{u\})}(w(G,v)\sqrt[p_1]{i(u,v)})$
- $\sum_{v \in (U-\{u\})}(a(G,v)\sqrt[p_2]{i(u,v)})$

Factors 1-4 may then be expressed as

$$R_1=c_1*w(G,u)$$
$$R_2=c_2*a(G,u)$$
$$R_3=c_3*\sum_{v \in (U-\{u\})}w(G,v)\sqrt[p_1]{i(u,v)}$$
$$R_4=c_4*\sum_{v \in (U-\{u\})}a(G,v)\sqrt[p_2]{i(u,v)}$$

where $c_1,c_2,c_3,c_4,p_1,p_2\in \mathbb{R}^+$, $p_1>1$, and $p_2>1$.

### Factor 5: Issue Alignment

This factor evaluates extent to which the issues assigned to some grant are relevant to some user $u$.

Let $j(u)$ be the percentage of issues assigned to *both* the grant in question *and* the user $u$. We might reasonably prefer that the existence of *any* issue overlap be valued more highly than the presence of *perfect* issue overlap. This can be achieved by transforming $j(u)$ using a radical. Factor 5 may then be expressed as

$$R_5=c_5*\sqrt[p_3]{j(u)}$$

where $c_5,p_3\in \mathbb{R}^+$ and $p_3>1$.

### Factor 6: Financial Fit

This factor evaluates the extent to which the total amount of money $m$ offered by some grant is relevant to the some user $u$.

Let $\bar{b}$ represent the average annual budget of $u$. We may then interpret the ratio between $m$ and $\bar{b}$ as a loose proxy for the appropriateness of the grant amount to $u$. For many users, it will be the case that $\bar{b}=0$, so we may reasonably wish to also define a minimum value $\bar{b}_{0}$ below which this factor will not be applied. Additionally, we might reasonably prefer that the weight of this factor increase non-linearly with the ratio $m\div\bar{b}$, which can be achieved by transforming it using a power function. Factor 6 may then be expressed as

$$
R_6=
\begin{cases}
	0 & b<\bar{b}_0 \\
	-c_6*(m\div{\bar{b}})^{p_4} & b\ge\bar{b}_0
\end{cases}
$$

where $c_6,p_4\in \mathbb{R}^+$ and $p_4>1$.

### Factor 7: Proximity to Target Region(s)

This factor evaluates the extent to which the location(s) at which some grant allows services to be offered are distinct from the communities that are served by some user $u$.

We may reasonably consider that a penalty should be applied if there is no direct overlap between the locations targeted by the grant and the communities served by $u$. Let $l$ represent the minimum distance between any location targeted by the grant and any community served by $u$. The feasibility of expanding the service area(s) to include at least one target location increases non-linearly with $l$, so we might reasonably prefer that the weight of this factor do the same, which can be achieved by transforming it using a power function. Factor 7 may then be expressed as

$$R_7=-c_7*l^{p_5}$$

where $c_7,p_5\in \mathbb{R}^+$ and $p_5>1$.

### Factors 8 and 9: Application Timeline

These factors evaluate the extent to which the dates at which applications for some grant open and close are relevant to some user $u$.

We may reasonably consider that a penalty should be applied if the application window will either not open for a long time or close in the very near future (because $u$ will not have enough time to apply). Let $t_o$ represent the number of days before applications will open and $t_c$ represent the number of days before they will close. We may reasonably consider that the utility of a grant recommendation increases non-linearly as the application window approaches and that the feasibility of applying to a grant decreases non-linearly as the deadline approaches (but only after $t_c$ is less than some number of days $d$ in which a typical applicant might reasonably be able to prepare a typical grant application). We can achieve these effects by transforming $t_o$ and $t_c$ using power functions. Factors 8 and 9 may then be expressed as

$$
R_8=
\begin{cases}
	-c_8*t_o^{p_6} & t_o>0 \\
	0 & t_o\le 0
\end{cases}
$$
$$
R_9=
\begin{cases}
	-c_9*t_c^{p_7} & t_c<d \\
	0 & t_c\ge d
\end{cases}
$$

where $c_8,c_9,p_6,p_7\in \mathbb{R}^+$, $t_o,t_c\in\mathbb{Z}^+$, $p_6>1$, and $p_7>1$.

### Factor 10: Collaborative Potential

This factor evaluates the extent to which the collaboration potential of some grant is relevant to some user $u$. We may define "collaboration potential" as measurable by the number of non-$u$ users who have expressed interest in applying for the grant in question.

Let $U$ represent the set of all users. Additionally, let $f(x)$ equal $1$ if some user $x\in U$ has expressed interest in applying for the grant in question and $0$ otherwise. We may then conjecture that the relevance of that grant to $u$ correlates at least somewhat with 

$$\sum_{v\in (U-\{u\})}f(v).$$

We may further conjecture that the extent to which the collaborative interest of some non-$u$ user $v$ is relevant to $u$ depends in part (but not necessarily in whole) on the percentage of issues that $u$ and $v$ have in common. Let $i(u,v$) be that percentage. We may then expand upon our initial expression as follows:

$$\sum_{v\in (U-\{u\})}f(v)*i(u,v).$$

Finally, we might also reasonably prefer that the existence of *any* issue overlap be valued more highly than the presence of *perfect* issue overlap. To achieve this, we may further refine our expression by transforming $i(u,v)$ using a radical. Factor 10 may then be expressed as

$$R_{10}=c_{10}*\sum_{v\in (U-\{u\})}f(v)*\sqrt[p_8]{i(u,v)}$$

where $c_{10},p_8\in \mathbb{R}^+$ and $p_8>1$.

### Factor 11: NSR Recommendation

This factor evaluates the extent to which a recommendation or endorsement of some grant from NSR is relevant to some user. We may reasonably consider that a relevance bonus should be applied if such a recommendation or endorsement exists. Factor 11 may then be expressed as

$$R_{11}=c_{11}$$

where $c_{11}\in \mathbb{R}^+$.

### Factors 12 and 13: Financial Barriers

These factors evaluate the extent to which the means by which funds are distributed for some grant is relevant to some user. We may reasonably consider that a relevance penalty should be applied if awardees are required to supply their own matching funds or make payments out of pocket and then seek reimbursement afterward because both requirements create financial barriers that might exclude some users from being able to take full advantage of the funds being offered. Factors 12 and 13 (which concern the matching funds and reimbursement requirements, respectively) may then be expressed as

$$R_{12}=-c_{12}$$
$$R_{13}=-c_{13}$$

where where $c_{12},c_{13}\in \mathbb{R}^+$.
### Composite Relevance

Based on all of the above, a composite relevance score may reasonably be expressed as

$$R=R_1+R_2+\cdots+R_{13}.$$
## Research and Development

### Methodology

After developing the initial version of the relevance metric (which accounted for only and all of the first 11 factors outlined in the previous section), we sought feedback from a total of 10 subject matter experts on both the robustness of the set of factors and the relative importance of each one. Half of the subject matter experts were current MHCI students at CMU (who brought analytical expertise), and half were NSR staff members (who brought extensive experience with grant finding). All 10 evaluators were asked to assess whether each of the 11 initial factors should be included in the relevance metric at all, suggest any additional factors that were not included in the initial set, and rank all of the factors by relative importance.

### Findings

The results were extremely promising. Nine out of the ten evaluators approved of all 11 initial factors, and the tenth and final evaluator (a CMU student) objected to only one of the factors. A total of 7 new factors were also proposed, two of which (Factors 12 and 13 in the previous section) were adopted. The 5 other factors and the reasons why they were not adopted are outlined in the table below.

| Factor                                                                                                                                                                                                     | Reasoning                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The date at which users would be notified if they were awarded the grant                                                                                                                                   | Other evaluators generally perceived the importance of this factor as negligible                                                                                                              |
| The number of steps in the application process for the grant                                                                                                                                               | This factor proved to be difficult for our AI-powered grant ingestion mechanism to reliably quantify                                                                                          |
| The financial health and viability of the grant (i.e., the probability that the awardee(s) would actually receive the associated funding and/or benefits as intended without interruption or cancellation) | The concerns associated with this factor would be more easily and reliably be mitigated by the fact that our grant ingestion mechanism requires NSR to maintain a living list of grant "hubs" |
| The quality of the non-monetary benefits offered by the grant                                                                                                                                              | This factor proved to be difficult for our AI-powered grant ingestion mechanism to reliably quantify                                                                                          |
| An estimate of the amount of time that would be required for a typical applicant to prepare an application for the grant                                                                                   | This factor proved to be difficult for our AI-powered grant ingestion mechanism to reliably quantify                                                                                          |

Finally, the relative importance rankings were used to inform the initial hyperparameter values that we propose in the next section. We began by conducting a quantitative analysis in which every ranking was converted into a set of sub-scores (one for each factor) quantized to a five-point scale. Composite factor scores were then computed as qualitatively weighted sums of those sub-scores. The results of this process were as follows (larger numbers represent greater importance):

| Factor                            | Composite Score |
| --------------------------------- | --------------- |
| 5 (Issue Alignment)               | 25              |
| 11 (NSR Recommendation)           | 22              |
| 1 (Personal Award History)        | 20              |
| 7 (Proximity to Target Region(s)) | 20              |
| 9 (Application Deadline)          | 20              |
| 3 (Personal Application History)  | 16              |
| 10 (Collaborative Potential)      | 15              |
| 8 (Application Start Date)        | 15              |
| 12 (Matching Funds Requirement)   | 15              |
| 13 (Reimbursement Requirement)    | 15              |
| 2 (Others' Award Histories)       | 13              |
| 6 (Financial Fit)                 | 13              |
| 4 (Others' Application Histories) | 12              |

### Suggested Initial Hyperparameter Values

The composite scores outlined above naturally divide all 13 factors into four "tiers" of importance:

- **Tier 1**: Factor 5 (Issue Alignment)
- **Tier 2**: Factors 11 (NSR Recommendation), 1 (Personal Award History), 7 (Proximity to Target Region(s)), and 9 (Application Deadline)
- **Tier 3**: Factors 3 (Personal Application History), 10 (Collaborative Potential), 8 (Application Start Date), 12 (Matching Funds Requirement), and 13 (Reimbursement Requirement)
- **Tier 4**: Factors 2 (Others' Award Histories), 6 (Financial Fit), and 4 (Others' Application Histories)

These tiers, together with a qualitative analysis of evaluators' spoken feedback, yielded the following suggestions for initial hyperparameter values:

| Hyperparameter | Suggested Initial Value |
| -------------- | ----------------------- |
| $c_1$          | 8                       |
| $c_2$          | 1.5                     |
| $c_3$          | 5                       |
| $c_4$          | 1                       |
| $c_5$          | 16                      |
| $c_6$          | 1.25                    |
| $c_7$          | 8                       |
| $c_8$          | 3                       |
| $c_9$          | 8                       |
| $c_{10}$       | 4                       |
| $c_{11}$       | 10                      |
| $c_{12}$       | 2                       |
| $c_{13}$       | 2                       |
| $p_1$          | 2                       |
| $p_2$          | 2                       |
| $p_3$          | 2                       |
| $p_4$          | 2                       |
| $p_5$          | 2                       |
| $p_6$          | 2                       |
| $p_7$          | 2                       |
| $p_8$          | 2                       |

Note that every $p$ hyperparameter has a suggested initial value of $2$, which is simply a reasonable default. We deliberately chose not to propose any deviations from that default prior to implementation because radicals and exponents (to which the $p$ hyperparameters correspond) are substantially more volatile and harder to control for (at least, without significant real world usage data) than multiplicative constants.