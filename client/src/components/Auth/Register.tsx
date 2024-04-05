import useAuth from "../../hooks/useAuth";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Grid, Card } from "@mui/material";

const RegisterSchema = yup.object({
  username: yup.string().required("Please enter a username"),
  email: yup
    .string()
    .email("Please enter a valid email")
    .required("An email is required to sign up"),
  password: yup.string().required("Please type your password"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegisterSchema),
  });

  const { register: signUp } = useAuth();

  const onSubmit = async (data: FieldValues) => {
    const { username, email, password } = data;
    console.log({ data });
    const userData = {
      username: username,
      email: email,
      password: password,
    };

    signUp(userData);
    console.log(errors);
  };

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
    // style={{ minHeight: "100vh" }}
    >
      <Card sx={{ minWidth: 800, mt: 10, p: 5 }}>
        <div>
          <h4 className="text-center pt-5">Register</h4>
          <div className="container">
            <div className="row">
              <div className="col-md-6 offset-md-3">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username :
                    </label>
                    <input
                      {...register("username")}
                      type="text"
                      className={`form-control ${errors?.username ? "is-invalid" : ""
                        }`}
                      id="username"
                    />
                    {errors?.username && (
                      <p className="text-danger">{errors.username?.message}</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address :
                    </label>
                    <input
                      {...register("email")}
                      className={`form-control ${errors?.email ? "is-invalid" : ""
                        }`}
                      id="email"
                    />
                    {errors?.email && (
                      <p className="text-danger">{errors.email?.message}</p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password :
                    </label>
                    <input
                      {...register("password")}
                      type="password"
                      className={`form-control ${errors?.password ? "is-invalid" : ""
                        }`}
                      id="password"
                    />
                    {errors?.password && (
                      <p className="text-danger">{errors.password?.message}</p>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm Password :
                    </label>
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      className={`form-control ${errors?.confirmPassword ? "is-invalid" : ""
                        }`}
                      id="confirmPassword"
                    />
                    {errors?.confirmPassword && (
                      <p className="text-danger">
                        {errors.confirmPassword?.message}
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Grid>
  );
};

export default Register;
